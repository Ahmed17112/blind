export default class Action {
  constructor({ action_id, latitude, longitude, type, userId, created_at }) {
    this.id   = action_id;
    this.lat  = latitude;
    this.lng  = longitude;
    this.type = type;          // e.g. "Obstacle"
    this.user = userId;        // FK → User
    this.time = created_at;    // توقيت الحدث
  }
}
