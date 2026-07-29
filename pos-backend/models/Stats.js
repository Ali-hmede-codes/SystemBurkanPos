const pool = require('../config/db');

class Stats {
  // Today's totals
  static async getToday() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(delivery_cost), 0) as total_delivery,
        COALESCE(SUM(subtotal), 0) as total_products_revenue
      FROM bills 
      WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'
    `);
    return rows[0];
  }

  // Today's bills breakdown by status
  static async getTodayByStatus() {
    const [rows] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM bills 
      WHERE DATE(created_at) = CURDATE()
      GROUP BY status
    `);
    return rows;
  }

  // Monthly summary (current year by default)
  static async getMonthly(year = null) {
    const targetYear = year || new Date().getFullYear();
    const [rows] = await pool.query(`
      SELECT 
        MONTH(created_at) as month,
        YEAR(created_at) as year,
        COUNT(*) as total_bills,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(delivery_cost), 0) as total_delivery,
        COALESCE(SUM(subtotal), 0) as total_products_revenue
      FROM bills 
      WHERE YEAR(created_at) = ? AND status != 'cancelled'
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY month ASC
    `, [targetYear]);
    return rows;
  }

  // Daily breakdown for a specific month
  static async getDaily(year, month) {
    const [rows] = await pool.query(`
      SELECT 
        DAY(created_at) as day,
        COUNT(*) as total_bills,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(delivery_cost), 0) as total_delivery
      FROM bills 
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND status != 'cancelled'
      GROUP BY DAY(created_at)
      ORDER BY day ASC
    `, [year, month]);
    return rows;
  }

  // Revenue by store
  static async getByStore(startDate = null, endDate = null) {
    let query = `
      SELECT 
        s.id as store_id,
        s.name as store_name,
        COUNT(b.id) as total_bills,
        COALESCE(SUM(b.total), 0) as total_revenue
      FROM stores s
      LEFT JOIN bills b ON s.id = b.store_id AND b.status != 'cancelled'
    `;
    const params = [];

    if (startDate && endDate) {
      query += ' AND DATE(b.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' GROUP BY s.id, s.name ORDER BY total_revenue DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = Stats;
