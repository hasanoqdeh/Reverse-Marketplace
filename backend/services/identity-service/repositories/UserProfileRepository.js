const BaseRepository = require('./BaseRepository');

class UserProfileRepository extends BaseRepository {
  constructor() {
    super();
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }

  async create(profileData) {
    const fields = [];
    const placeholders = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(profileData)) {
      fields.push(key);
      placeholders.push(`$${paramIndex++}`);
      values.push(key === 'preferences' ? JSON.stringify(value) : value);
    }

    const query = `INSERT INTO user_profiles (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(userId, profileData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(profileData)) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(key === 'preferences' ? JSON.stringify(value) : value);
    }

    if (fields.length === 0) return null;

    values.push(userId);
    const query = `UPDATE user_profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${paramIndex} RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }
}

module.exports = UserProfileRepository;
