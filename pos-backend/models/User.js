const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async getByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async create({ username, password, full_name, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role || 'cashier']
    );
    return this.getById(result.insertId);
  }

  static async update(id, { username, full_name, role, is_active }) {
    await pool.query(
      'UPDATE users SET username = ?, full_name = ?, role = ?, is_active = ? WHERE id = ?',
      [username, full_name, role, is_active, id]
    );
    return this.getById(id);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
