export default class Battery {
  constructor(level = null) {     // 0–100 (%)
    this.level = level;
  }
  /** يقرأ bat= من الـ URL */
  static fromQuery() {
    const n = parseInt(new URLSearchParams(location.search).get('bat'), 10);
    return isNaN(n) ? new Battery(null) : new Battery(n);
  }
  isLow(th = 20) { return this.level !== null && this.level <= th; }
}
