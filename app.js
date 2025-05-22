/* =====================================================================
 *  js/app.js  (all logic in one file)
 * ===================================================================== */

/* ========= ① Models ========= */
export class User {
  constructor({ id, userId, user_name, email, role, blindPeople = [] }) {
    this.id = id;
    this.userId = userId;
    this.name = user_name;
    this.email = email;
    this.role = role;
    this.blindPeople = blindPeople;
  }
}

export class Action {
  constructor({ action_id, latitude, longitude, type, userId, created_at }) {
    Object.assign(this, { action_id, latitude, longitude, type, userId, created_at });
  }
}

export class Notification {
  constructor({ message, battery_level = null, css = '' }) {
    this.id       = crypto.randomUUID();
    this.time     = Date.now();
    this.message  = message;
    this.battery  = battery_level;
    this.css      = css;
  }
}

export class Battery {
  constructor(level = null) { this.level = level; }
  static fromURL() {
    const n = parseInt(new URLSearchParams(location.search).get('bat'), 10);
    return isNaN(n) ? new Battery(null) : new Battery(n);
  }
  isLow(th = 20) { return this.level !== null && this.level <= th; }
}

/* ========= ② Battery & Notifications UI ========= */
function updateBattery(level) {
  const fill  = document.getElementById('batteryFill');
  const label = document.getElementById('batteryPercent');
  const card  = document.getElementById('battery-card');
  if (!fill || !label || !card) return;

  fill.style.width   = `${level}%`;
  label.textContent  = `${level} %`;

  card.classList.remove('bat-low', 'bat-mid', 'bat-ok');
  if (level <= 15)       card.classList.add('bat-low');
  else if (level <= 35)  card.classList.add('bat-mid');
  else                   card.classList.add('bat-ok');

  if (level <= 20) saveNotif(
    new Notification({ message: `Low battery (${level} %)`, battery_level: level, css: 'lowBat' })
  );
}

function saveNotif(notif) {
  const store = JSON.parse(localStorage.getItem('notifications') || '[]');
  store.unshift(notif);
  localStorage.setItem('notifications', JSON.stringify(store.slice(0, 50)));
  paintNotif(notif);
}

function paintNotif({ message, time, css }) {
  const list = document.getElementById('notifList');
  if (!list) return;
  const li = document.createElement('li');
  li.className = css;
  li.innerHTML = `
    <span class="icon">🔔</span>
    <span>[${new Date(time).toLocaleTimeString()}] ${message}</span>`;
  list.prepend(li);
}

document.addEventListener('DOMContentLoaded', () => {
  const bat = Battery.fromURL();      // read ?bat= from URL
  if (bat.level !== null) updateBattery(bat.level);

  JSON.parse(localStorage.getItem('notifications') || '[]')
    .slice(0, 5)
    .forEach(paintNotif);
});

/* =====================================================================
 *  Existing logic (login, registration, map, etc.)
 * ===================================================================== */

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;

/* ---------- Login ---------- */
document.getElementById('loginButton')?.addEventListener('click', () => {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const loginErr = document.getElementById('loginError');
  loginErr.style.display = 'none';

  if (!email || !password) {
    loginErr.textContent = 'Please enter both email and password.';
    loginErr.style.display = 'block';
    return;
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.location.href = 'home.html';
  } else {
    loginErr.textContent = 'Invalid credentials! Please check your email or password.';
    loginErr.style.display = 'block';
  }
});

/* ---------- Registration ---------- */
document.getElementById('registerButton')?.addEventListener('click', () => {
  const email           = document.getElementById('registerEmail').value.trim();
  const password        = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
  const regErr          = document.getElementById('registerError');
  regErr.style.display = 'none';

  if (!email || !password || !confirmPassword) {
    regErr.textContent = 'Please fill in all fields.';
    regErr.style.display = 'block';
    return;
  }
  if (password !== confirmPassword) {
    regErr.textContent = 'Passwords do not match!';
    regErr.style.display = 'block';
    return;
  }
  if (users.find(u => u.email === email)) {
    regErr.textContent = 'User with this email already exists!';
    regErr.style.display = 'block';
    return;
  }

  users.push({ email, password, blindPeople: [] });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful!');
  window.location.href = 'index.html';
});

/* ---------- Forgot password ---------- */
document.getElementById('forgotButton')?.addEventListener('click', () => {
  const email   = document.getElementById('forgotEmail').value.trim();
  const okMsg   = document.getElementById('forgotMessage');
  const errMsg  = document.getElementById('forgotError');
  okMsg.style.display = errMsg.style.display = 'none';

  if (!email) {
    errMsg.textContent = 'Please enter your email.';
    errMsg.style.display = 'block';
    return;
  }

  const user = users.find(u => u.email === email);
  if (user) {
    okMsg.textContent = 'Password reset instructions have been sent to your email!';
    okMsg.style.display = 'block';
  } else {
    errMsg.textContent = 'Email not found! Please check your email address.';
    errMsg.style.display = 'block';
  }
});

/* ---------- Add Blind Person ---------- */
document.getElementById('addBlindPersonButton')?.addEventListener('click', () => {
  const blindName = prompt("Enter the blind person's name:");
  if (!blindName) return;
  currentUser.blindPeople.push({
    name: blindName,
    location: { lat: 24.7136, lng: 46.6753 } // sample location
  });
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  alert('Blind person added!');
  renderBlindPeople();
});

/* ---------- UI helpers ---------- */
function renderBlindPeople() {
  const list = document.getElementById('blindPeopleList');
  if (!list) return;
  list.innerHTML = '';

  const bp = currentUser ? currentUser.blindPeople : [];
  if (!bp.length) {
    list.innerHTML = '<p>No blind people added yet.</p>';
    return;
  }

  bp.forEach(blind => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${blind.name}</strong><br>
                      Location: Lat ${blind.location.lat}, Lng ${blind.location.lng}`;

    const btn = document.createElement('button');
    btn.textContent = 'Show Location on Map';
    btn.addEventListener('click', () => {
      initMap(blind.location.lat, blind.location.lng);
      sendTargetToESP32(blind.location.lat, blind.location.lng);
    });

    card.appendChild(btn);
    list.appendChild(card);
  });
}

/* ---------- Map ---------- */
function initMap(lat = 24.7136, lng = 46.6753) {
  const loc = { lat, lng };
  const map = new google.maps.Map(
    document.getElementById('map'),
    { center: loc, zoom: 14 }
  );
  new google.maps.Marker({ position: loc, map, title: 'Blind Person Location' });
}

/* ---------- ESP32 ---------- */
function sendTargetToESP32(lat, lng) {
  fetch('http://ESP32_IP/sendTarget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  })
    .then(r => r.json())
    .then(d => console.log('Target sent:', d))
    .catch(err => console.error('Error:', err));
}
