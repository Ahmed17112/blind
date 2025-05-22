export default class Notification {
  constructor({
    notification_id = crypto.randomUUID(),
    action_id = null,
    user_id   = null,
    message,
    battery_level = null,
    created_at = Date.now()
  }) {
    this.id      = notification_id;
    this.action  = action_id;
    this.user    = user_id;
    this.message = message;
    this.battery = battery_level;
    this.time    = created_at;
  }
}
