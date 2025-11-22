const { pool } = require('../config/database');

class Link {
  // Create a new link
  static async create(code, targetUrl) {
    const query = `
      INSERT INTO links (code, target_url)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [code, targetUrl];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find link by code
  static async findByCode(code) {
    const query = 'SELECT * FROM links WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }

  // Get all links
  static async findAll() {
    const query = 'SELECT * FROM links ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Increment click count and update last clicked
  static async incrementClick(code) {
    const query = `
      UPDATE links
      SET total_clicks = total_clicks + 1,
          last_clicked = CURRENT_TIMESTAMP
      WHERE code = $1
      RETURNING *
    `;
    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }

  // Delete link by code
  static async deleteByCode(code) {
    const query = 'DELETE FROM links WHERE code = $1 RETURNING *';
    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }

  // Check if code exists
  static async codeExists(code) {
    const link = await this.findByCode(code);
    return link !== null;
  }
}

module.exports = Link;

