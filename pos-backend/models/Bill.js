const pool = require('../config/db');

class Bill {
  static async getAll(storeId = null, status = null) {
    let query = `
      SELECT b.*, s.name as store_name 
      FROM bills b 
      JOIN stores s ON b.store_id = s.id
    `;
    const params = [];
    const conditions = [];

    if (storeId) {
      conditions.push('b.store_id = ?');
      params.push(storeId);
    }
    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY b.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getById(id) {
    const [billRows] = await pool.query(
      `SELECT b.*, s.name as store_name, s.location as store_location, s.phone_number as store_phone
       FROM bills b 
       JOIN stores s ON b.store_id = s.id 
       WHERE b.id = ?`,
      [id]
    );

    if (!billRows[0]) return null;

    const bill = billRows[0];

    // Get bill items
    const [items] = await pool.query(
      'SELECT * FROM bill_items WHERE bill_id = ? ORDER BY id ASC',
      [id]
    );

    bill.items = items;
    return bill;
  }

  static async create({ store_id, customer_name, customer_phone, customer_address, delivery_cost, notes, items }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Calculate subtotal from items
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.price * item.quantity;
      }

      const total = subtotal + (parseFloat(delivery_cost) || 0);

      // Insert bill
      const [billResult] = await connection.query(
        `INSERT INTO bills (store_id, customer_name, customer_phone, customer_address, delivery_cost, subtotal, total, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [store_id, customer_name, customer_phone, customer_address, delivery_cost || 0, subtotal, total, notes]
      );

      const billId = billResult.insertId;

      // Insert bill items
      for (const item of items) {
        const lineTotal = item.price * item.quantity;
        await connection.query(
          `INSERT INTO bill_items (bill_id, product_id, product_name, product_price, quantity, line_total) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [billId, item.product_id, item.product_name, item.price, item.quantity, lineTotal]
        );
      }

      await connection.commit();
      return this.getById(billId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, { store_id, customer_name, customer_phone, customer_address, delivery_cost, status, notes, items }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Calculate subtotal from items
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.price * item.quantity;
      }

      const total = subtotal + (parseFloat(delivery_cost) || 0);

      // Update bill
      await connection.query(
        `UPDATE bills SET store_id = ?, customer_name = ?, customer_phone = ?, customer_address = ?, 
         delivery_cost = ?, subtotal = ?, total = ?, status = ?, notes = ? WHERE id = ?`,
        [store_id, customer_name, customer_phone, customer_address, delivery_cost || 0, subtotal, total, status || 'draft', notes, id]
      );

      // Delete old items and insert new ones
      await connection.query('DELETE FROM bill_items WHERE bill_id = ?', [id]);

      for (const item of items) {
        const lineTotal = item.price * item.quantity;
        await connection.query(
          `INSERT INTO bill_items (bill_id, product_id, product_name, product_price, quantity, line_total) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, item.product_id, item.product_name, item.price, item.quantity, lineTotal]
        );
      }

      await connection.commit();
      return this.getById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE bills SET status = ? WHERE id = ?', [status, id]);
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM bills WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Bill;
