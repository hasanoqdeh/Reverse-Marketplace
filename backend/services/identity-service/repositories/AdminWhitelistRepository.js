const BaseRepository = require('./BaseRepository');

class AdminWhitelistRepository extends BaseRepository {
  constructor() {
    super();
  }

  async findByPhone(phone) {
    const result = await this.db.query(
      'SELECT * FROM admin_whitelist WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  }

  async findActiveByPhone(phone) {
    const result = await this.db.query(
      'SELECT * FROM admin_whitelist WHERE phone = $1 AND is_active = true',
      [phone]
    );
    return result.rows[0];
  }

  async create(adminData) {
    const { phone, admin_level, name, department } = adminData;
    const result = await this.db.query(
      'INSERT INTO admin_whitelist (phone, admin_level, name, department) VALUES ($1, $2, $3, $4) RETURNING *',
      [phone, admin_level, name, department]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }

    values.push(id);
    const query = `UPDATE admin_whitelist SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    await this.db.query('DELETE FROM admin_whitelist WHERE id = $1', [id]);
  }

  async findMany(params) {
    const { skip, take, where } = params;
    let query = 'SELECT * FROM admin_whitelist';
    const values = [];
    let paramIndex = 1;

    if (where) {
      const conditions = [];
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';

    if (take) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(take);
    }
    if (skip) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(skip);
    }

    const result = await this.db.query(query, values);
    return result.rows;
  }

  async count(params) {
    const { where } = params;
    let query = 'SELECT COUNT(*) FROM admin_whitelist';
    const values = [];
    let paramIndex = 1;

    if (where) {
      const conditions = [];
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.db.query(query, values);
    return parseInt(result.rows[0].count);
  }
}

module.exports = AdminWhitelistRepository;
