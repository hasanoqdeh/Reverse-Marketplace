const BaseRepository = require('./BaseRepository');

class OtpCodeRepository extends BaseRepository {
  constructor() {
    super();
  }

  async create(userId, phone, code, purpose, expiresAt) {
    const result = await this.db.query(
      'INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, phone, code, purpose, expiresAt]
    );
    return result.rows[0];
  }

  async findLatestUnused(phone, purpose) {
    const result = await this.db.query(
      'SELECT * FROM otp_codes WHERE phone = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [phone, purpose]
    );
    return result.rows[0];
  }

  async markAsUsed(id) {
    const result = await this.db.query(
      'UPDATE otp_codes SET used_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  async incrementAttempts(id) {
    const result = await this.db.query(
      'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = OtpCodeRepository;
