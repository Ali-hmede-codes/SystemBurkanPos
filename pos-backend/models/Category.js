const pool = require('../config/db');

class Category {
  static async getAll(storeId = null) {
    let query = 'SELECT c.*, s.name as store_name FROM categories c JOIN stores s ON c.store_id = s.id';
    const params = [];

    if (storeId) {
      query += ' WHERE c.store_id = ?';
      params.push(storeId);
    }

    query += ' ORDER BY c.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT c.*, s.name as store_name FROM categories c JOIN stores s ON c.store_id = s.id WHERE c.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async getByStoreId(storeId) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE store_id = ? ORDER BY name ASC',
      [storeId]
    );
    return rows;
  }

  static async create({ store_id, name, description }) {
    const [result] = await pool.query(
      'INSERT INTO categories (store_id, name, description) VALUES (?, ?, ?)',
      [store_id, name, description]
    );
    return this.getById(result.insertId);
  }

  static async update(id, { store_id, name, description }) {
    await pool.query(
      'UPDATE categories SET store_id = ?, name = ?, description = ? WHERE id = ?',
      [store_id, name, description, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Category;
