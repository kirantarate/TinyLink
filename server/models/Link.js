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

  // Get all links with pagination (page-based)
  static async findAllPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM links 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get all links with offset-based pagination (start-based)
  static async findAllWithOffset(start = 0, limit = 10) {
    const query = `
      SELECT * FROM links 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, start]);
    return result.rows;
  }

  // Get total count of links
  static async getTotalCount() {
    const query = 'SELECT COUNT(*) as total FROM links';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Increment click count and update last clicked
  static async incrementClick(code) {
    try {
      // Get current values for logging
      const currentQuery = 'SELECT total_clicks, last_clicked FROM links WHERE code = $1';
      const currentResult = await pool.query(currentQuery, [code]);
      
      if (currentResult.rows.length === 0) {
        throw new Error(`No link found with code: ${code} for click increment`);
      }
      
      const current = currentResult.rows[0];
      console.log(`[DB] Before update - Code: ${code}, Current clicks: ${current.total_clicks || 0}, Last clicked: ${current.last_clicked || 'NULL'}`);
      
      // Simple UPDATE query - PostgreSQL handles this atomically
      const updateQuery = `
        UPDATE links
        SET total_clicks = COALESCE(total_clicks, 0) + 1,
            last_clicked = CURRENT_TIMESTAMP
        WHERE code = $1
        RETURNING id, code, target_url, total_clicks, last_clicked, created_at
      `;
      
      const result = await pool.query(updateQuery, [code]);
      
      if (result.rows.length === 0) {
        throw new Error(`Update failed for code: ${code} - no rows updated`);
      }
      
      if (result.rowCount !== 1) {
        console.warn(`[DB] Warning: Updated ${result.rowCount} rows instead of 1 for code: ${code}`);
      }
      
      const updated = result.rows[0];
      console.log(`[DB] After update - Code: ${code}, New clicks: ${updated.total_clicks}, New last_clicked: ${updated.last_clicked}`);
      console.log(`[DB] ✓ Update successful - Rows affected: ${result.rowCount}`);
      
      // Verify immediately after update
      const verifyQuery = 'SELECT total_clicks, last_clicked FROM links WHERE code = $1';
      const verifyResult = await pool.query(verifyQuery, [code]);
      if (verifyResult.rows.length > 0) {
        const verified = verifyResult.rows[0];
        console.log(`[DB] Verification - Code: ${code}, Verified clicks: ${verified.total_clicks}, Verified last_clicked: ${verified.last_clicked}`);
        if (parseInt(verified.total_clicks) !== parseInt(updated.total_clicks)) {
          console.error(`[DB] ERROR: Database value mismatch! Expected: ${updated.total_clicks}, Got: ${verified.total_clicks}`);
        } else {
          console.log(`[DB] ✓ Database update verified successfully`);
        }
      }
      
      return updated;
    } catch (error) {
      console.error(`[DB] Error in incrementClick for code ${code}:`, error.message);
      console.error(`[DB] Error stack:`, error.stack);
      throw error;
    }
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

  // Find link by target URL
  static async findByTargetUrl(targetUrl) {
    const query = 'SELECT * FROM links WHERE target_url = $1';
    const result = await pool.query(query, [targetUrl]);
    return result.rows[0] || null;
  }

  // Check if target URL exists
  static async targetUrlExists(targetUrl) {
    const link = await this.findByTargetUrl(targetUrl);
    return link !== null;
  }
}

module.exports = Link;

