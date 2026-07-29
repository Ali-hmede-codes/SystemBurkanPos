require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

/**
 * Seeds the default admin user into the database
 * Default credentials: admin / admin123
 */
async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pos_system',
    });

    // Check if admin already exists
    const [existing] = await connection.query("SELECT id FROM users WHERE username = 'admin'");
    if (existing.length > 0) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert admin user
    await connection.query(
      "INSERT INTO users (username, password, full_name, role) VALUES ('admin', ?, 'System Admin', 'admin')",
      [hashedPassword]
    );

    console.log('Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('** Change this password after first login! **');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

seed();
