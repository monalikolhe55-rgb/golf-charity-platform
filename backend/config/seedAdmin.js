// Run this ONCE with: npm run seed-admin
// It creates a default admin account so you can log into the admin panel.

const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedAdmin() {
  const name = 'Admin';
  const email = 'admin@golfcharity.com';
  const plainPassword = 'admin123';

  try {
    // Check if this admin already exists, so we don't create duplicates
    const existing = await db.query('SELECT id FROM admin_users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log('ℹ️ Admin already exists. Email:', email);
      process.exit(0);
    }

    // Hash the password before saving (never store plain text passwords)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await db.query(
      'INSERT INTO admin_users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    console.log('✅ Admin account created!');
    console.log('   Email:', email);
    console.log('   Password:', plainPassword);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
