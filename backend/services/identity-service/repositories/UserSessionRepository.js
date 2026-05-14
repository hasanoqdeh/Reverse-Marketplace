const BaseRepository = require('./BaseRepository');

class UserSessionRepository extends BaseRepository {
  constructor() {
    super();
  }

  async create(sessionData) {
    const { user_id, session_token, device_fingerprint, ip_address, user_agent, expires_at } = sessionData;
    const result = await this.db.query(
      'INSERT INTO user_sessions (user_id, session_token, device_fingerprint, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, session_token, device_fingerprint, ip_address, user_agent, expires_at]
    );
    return result.rows[0];
  }

  async findByToken(sessionToken) {
    const result = await this.db.query(
      'SELECT * FROM user_sessions WHERE session_token = $1',
      [sessionToken]
    );
    return result.rows[0];
  }

  async deactivateByUserId(userId) {
    const result = await this.db.query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1 RETURNING *',
      [userId]
    );
    return result.rows;
  }
}

module.exports = UserSessionRepository;
