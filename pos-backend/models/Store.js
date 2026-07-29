const pool = require('../config/db');

class Store {
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM stores ORDER BY created_at DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, location, phone_number }) {
    const [result] = await pool.query(
      'INSERT INTO stores (name, location, phone_number) VALUES (?, ?, ?)',
      [name, location, phone_number]
    );
    return this.getById(result.insertId);
  }

  static async update(id, { name, location, phone_number }) {
    await pool.query(
      'UPDATE stores SET name = ?, location = ?, phone_number = ? WHERE id = ?',
      [name, location, phone_number, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM stores WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Store;
