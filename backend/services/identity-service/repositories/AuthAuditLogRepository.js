const BaseRepository = require('./BaseRepository');

class AuthAuditLogRepository extends BaseRepository {
  constructor() {
    super();
  }

  async logEvent(eventData) {
    const { user_id, event_type, phone, ip_address, user_agent, device_fingerprint, success, failure_reason, metadata } = eventData;
    const result = await this.db.query(
      `INSERT INTO auth_audit_logs (user_id, event_type, phone, ip_address, user_agent, device_fingerprint, success, failure_reason, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user_id, event_type, phone, ip_address, user_agent, device_fingerprint, success, failure_reason, JSON.stringify(metadata)]
    );
    return result.rows[0];
  }
}

module.exports = AuthAuditLogRepository;
