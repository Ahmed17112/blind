/* ===================================================================== *
 *  js/app.js  (وَحّدنا كل شيء هنا)                                     *
 * ===================================================================== */

/* ===== BEGIN NEW ❶  الكلاسات ========================================= */
export class User {
  constructor({ id, userId, user_name, email, role, blindPeople = [] }) {
    this.id = id; this.userId = userId; this.name = user_name;
    this.email = email; this.role = role; this.blindPeople = blindPeople;
  }
}
export class Action {
  constructor({ action_id, latitude, longitude, type, userId, created_at }) {
    Object.assign(this, { action_id, latitude, longitude, type, userId, created_at });
  }
}
export class Notification {
  constructor({ message, battery_level = null, css = '' }) {
    this.id   = crypto.randomUUID();
    this.time = Date.now();
    this.message = message;
    this.battery = battery_level;
    this.css  = css;
  }
}
export class Battery {
  constructor(level = null) { this.level = level; }
  static fromURL() {
    const n = parseInt(new URLSearchParams(location.search).get('bat'), 10);
    return isNaN(n) ? new Battery(null) : new Battery(n);
  }
  isLow(t = 20) { return this.level !== null && this.level <= t; }
}
/* ===== END NEW ❶ ===================================================== */


/* ===== BEGIN NEW ❷  البطارية + الإشعارات ============================ */
function updateBattery(level) {
  const fill  = document.getElementById('batteryFill'),
        label = document.getElementById('batteryPercent'),
        card  = document.getElementById('battery-card');
  if (!fill || !label || !card) return;           // هذه الصفحة قد لا تحتوي لوحة البطارية
  fill.style.width = level + '%';
  label.textContent = level + ' %';

  card.classList.remove('bat-low','bat-mid','bat-ok');
  if (level <= 15)      card.classList.add('bat-low');
  else if (level <= 35) card.classList.add('bat-mid');
  else                  card.classList.add('bat-ok');

  if (level <= 20) saveNotif(new Notification({ message:`Low battery (${level} %)`, battery_level:level, css:'lowBat' }));
}

function saveNotif(notif) {
  const store = JSON.parse(localStorage.getItem('notifications') || '[]');
  store.unshift(notif);
  localStorage.setItem('notifications', JSON.stringify(store.slice(0,50)));
  paintNotif(notif);
}
function paintNotif({ message, time, css }) {
  const list = document.getElementById('notifList');
  if (!list) return;
  const li = document.createElement('li');
  li.className = css;
  li.innerHTML = `<span class="icon">🔔</span>
                  <span>[${new Date(time).toLocaleTimeString()}] ${message}</span>`;
  list.prepend(li);
}

/* عند تحميل أي صفحة: طبّق البطارية (إن وُجدت) و اعرض آخر 5 إشعارات */
document.addEventListener('DOMContentLoaded', () => {
  // بطارية من URL
  const bat = Battery.fromURL();
  if (bat.level !== null) updateBattery(bat.level);

  // إشعارات مخزنّة
  JSON.parse(localStorage.getItem('notifications')||'[]')
        .slice(0,5)
        .forEach(paintNotif);
});
/* ===== END NEW ❷ ===================================================== */


/* ===================================================================== *
 *              كودك الأصلي كما هو (Login / Register / Map …)            *
 * ===================================================================== */

// JavaScript to handle page transitions, form submissions, etc.
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;

// Handling login
document.getElementById('loginButton')?.addEventListener('click', function() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const user = users.find(u => u.email === email && u.password === password);

  const loginError = document.getElementById('loginError');
  loginError.style.display = 'none';

  if (email === "" || password === "") {
    loginError.textContent = "Please enter both email and password.";
    loginError.style.display = 'block';
    return;
  }
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.location.href = 'home.html';
  } else {
    loginError.textContent = 'Invalid credentials! Please check your email or password.';
    loginError.style.display = 'block';
  }
});

// Handling registration
document.getElementById('registerButton')?.addEventListener('click', function() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
  const registerError = document.getElementById('registerError');
  registerError.style.display = 'none';

  if (email === "" || password === "" || confirmPassword === "") {
    registerError.textContent = "Please fill in all fields.";
    registerError.style.display = 'block';
    return;
  }
  if (password !== confirmPassword) {
    registerError.textContent = "Passwords do not match!";
    registerError.style.display = 'block';
    return;
  }
  if (users.find(u => u.email === email)) {
    registerError.textContent = "User with this email already exists!";
    registerError.style.display = 'block';
    return;
  }
  users.push({ email, password, blindPeople: [] });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful!');
  window.location.href = 'index.html';
});

// Handling forgot password
document.getElementById('forgotButton')?.addEventListener('click', function() {
  const email = document.getElementById('forgotEmail').value.trim();
  const forgotMessage = document.getElementById('forgotMessage');
  const forgotError = document.getElementById('forgotError');

  forgotMessage.style.display = 'none';
  forgotError.style.display = 'none';

  if (email === "") {
    forgotError.textContent = "Please enter your email.";
    forgotError.style.display = 'block';
    return;
  }
  const user = users.find(u => u.email === email);
  if (user) {
    forgotMessage.textContent = "Password reset instructions have been sent to your email!";
    forgotMessage.style.display = 'block';
  } else {
    forgotError.textContent = "Email not found! Please check your email address.";
    forgotError.style.display = 'block';
  }
});

// Add Blind Person
document.getElementById('addBlindPersonButton')?.addEventListener('click', function() {
  const blindName = prompt("Enter the blind person's name:");
  if (blindName) {
    currentUser.blindPeople.push({ name: blindName, location: { lat: 24.7136, lng: 46.6753 } });
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert('Blind person added!');
    renderBlindPeople();
  }
});

// Render the list of blind people
function renderBlindPeople() {
  const blindPeopleList = document.getElementById('blindPeopleList');
  if (!blindPeopleList) return;
  blindPeopleList.innerHTML = '';
  const blindPeople = currentUser ? currentUser.blindPeople : [];
  if (blindPeople.length === 0) {
    blindPeopleList.innerHTML = '<p>No blind people added yet.</p>';
    return;
  }
  blindPeople.forEach(blind => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${blind.name}</strong><br>
                      Location: Lat ${blind.location.lat}, Lng ${blind.location.lng}`;

    const showLocationButton = document.createElement('button');
    showLocationButton.textContent = 'Show Location on Map';
    showLocationButton.addEventListener('click', () => {
      initMap(blind.location.lat, blind.location.lng);
      sendTargetToESP32(blind.location.lat, blind.location.lng);
    });
    card.appendChild(showLocationButton);
    blindPeopleList.appendChild(card);
  });
}

// Initialize Google Map
function initMap(lat = 24.7136, lng = 46.6753) {
  const location = { lat, lng };
  const map = new google.maps.Map(document.getElementById('map'), { center: location, zoom: 14 });
  new google.maps.Marker({ position: location, map, title: 'Blind Person Location' });
}

// Send target to ESP32
function sendTargetToESP32(lat, lng) {
  fetch("http://ESP32_IP/sendTarget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  })
  .then(r => r.json())
  .then(d => console.log("Target sent:", d))
  .catch(err => console.error("Error:", err));
}

/* ===================================================================== *
 *                  نهاية كودك الأصلي + التحسينات                         *
 * ===================================================================== */
