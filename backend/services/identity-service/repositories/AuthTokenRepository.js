const BaseRepository = require('./BaseRepository');

class AuthTokenRepository extends BaseRepository {
  constructor() {
    super();
  }

  async create(tokenData) {
    const { user_id, token_type, token_hash, device_fingerprint, ip_address, user_agent, expires_at } = tokenData;
    const result = await this.db.query(
      'INSERT INTO auth_tokens (user_id, token_type, token_hash, device_fingerprint, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, token_type, token_hash, device_fingerprint, ip_address, user_agent, expires_at]
    );
    return result.rows[0];
  }

  async findValidToken(tokenHash, tokenType) {
    const result = await this.db.query(
      'SELECT * FROM auth_tokens WHERE token_hash = $1 AND token_type = $2 AND revoked_at IS NULL AND expires_at > NOW()',
      [tokenHash, tokenType]
    );
    return result.rows[0];
  }

  async revoke(id) {
    const result = await this.db.query(
      'UPDATE auth_tokens SET revoked_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  async revokeByUserId(userId, tokenType) {
    const result = await this.db.query(
      'UPDATE auth_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_type = $2 RETURNING *',
      [userId, tokenType]
    );
    return result.rows;
  }

  async findActiveByHash(tokenHash, tokenType) {
    const result = await this.db.query(
      'SELECT * FROM auth_tokens WHERE token_hash = $1 AND token_type = $2 AND revoked_at IS NULL',
      [tokenHash, tokenType]
    );
    return result.rows[0];
  }
}

module.exports = AuthTokenRepository;
