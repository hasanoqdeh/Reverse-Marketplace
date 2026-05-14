const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super();
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async findByPhone(phone) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  }

  async create(userData) {
    const { phone, role, status, phone_verified } = userData;
    const result = await this.db.query(
      'INSERT INTO users (phone, role, status, phone_verified) VALUES ($1, $2, $3, $4) RETURNING *',
      [phone, role || 'BUYER', status || 'PENDING', phone_verified || false]
    );
    return result.rows[0];
  }

  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(userData)) {
      if (key !== 'id') {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async incrementFailedAttempts(id) {
    const result = await this.db.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1 RETURNING failed_login_attempts',
      [id]
    );
    return result.rows[0]?.failed_login_attempts;
  }

  async resetFailedAttempts(id) {
    await this.db.query(
      'UPDATE users SET failed_login_attempts = 0 WHERE id = $1',
      [id]
    );
  }

  async lockAccount(id, lockedUntil) {
    const result = await this.db.query(
      'UPDATE users SET locked_until = $1 WHERE id = $2 RETURNING *',
      [lockedUntil, id]
    );
    return result.rows[0];
  }

  async unlockAccount(id) {
    const result = await this.db.query(
      'UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  async updateVerificationAndLogin(id, status, newStatus) {
    const result = await this.db.query(
      'UPDATE users SET phone_verified = true, last_login_at = NOW(), status = CASE WHEN status = $1 THEN $2 ELSE status END WHERE id = $3 RETURNING *',
      [status, newStatus, id]
    );
    return result.rows[0];
  }

  async upsertAdminUser(phone, role, name) {
    // Check if user exists
    let user = await this.findByPhone(phone);
    
    if (user) {
      // Update role and status
      user = await this.update(user.id, { role: 'ADMIN', status: 'ACTIVE' });
    } else {
      // Create new admin user
      user = await this.create({
        phone,
        role: 'ADMIN',
        status: 'ACTIVE',
        phone_verified: true
      });
    }
    
    return user;
  }
}

module.exports = UserRepository;
