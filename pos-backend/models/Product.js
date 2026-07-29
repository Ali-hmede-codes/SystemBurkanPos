const pool = require('../config/db');

class Product {
  static async getAll(storeId = null, categoryId = null) {
    let query = `
      SELECT p.*, s.name as store_name, c.name as category_name 
      FROM products p 
      JOIN stores s ON p.store_id = s.id 
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (storeId) {
      conditions.push('p.store_id = ?');
      params.push(storeId);
    }
    if (categoryId) {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, s.name as store_name, c.name as category_name 
       FROM products p 
       JOIN stores s ON p.store_id = s.id 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async getByStoreId(storeId) {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.store_id = ? AND p.is_active = 1 
       ORDER BY p.name ASC`,
      [storeId]
    );
    return rows;
  }

  static async create({ store_id, category_id, name, price, description, sku }) {
    const [result] = await pool.query(
      'INSERT INTO products (store_id, category_id, name, price, description, sku) VALUES (?, ?, ?, ?, ?, ?)',
      [store_id, category_id || null, name, price, description, sku]
    );
    return this.getById(result.insertId);
  }

  static async update(id, { store_id, category_id, name, price, description, sku, is_active }) {
    await pool.query(
      'UPDATE products SET store_id = ?, category_id = ?, name = ?, price = ?, description = ?, sku = ?, is_active = ? WHERE id = ?',
      [store_id, category_id || null, name, price, description, sku, is_active, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Product;
