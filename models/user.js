export default class User {
  constructor({ id, userId, user_name, email, role }) {
    this.id     = id;          // PK في قاعدة البيانات
    this.userId = userId;      // Firebase Auth uid مثلًا
    this.name   = user_name;
    this.email  = email;
    this.role   = role;        // "blind" | "guardian"
  }
}
