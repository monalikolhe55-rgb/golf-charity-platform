// Handles: user register, user login, admin login.
// Every successful login returns a JWT token the frontend must store and send back on future requests.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Helper function to create a JWT token for a logged-in user/admin
function createToken(payload) {
  // Token expires in 7 days - after that the user must log in again
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ============================================
// POST /api/auth/register  -> create a new user account
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, charity_id } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Check if email is already used
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (charity_id is optional at registration)
    const result = await db.query(
      `INSERT INTO users (name, email, password, charity_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, charity_id`,
      [name, email, hashedPassword, charity_id || null]
    );

    const newUser = result.rows[0];

    // Log the user in immediately by giving them a token
    const token = createToken({ id: newUser.id, role: 'user' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ============================================
// POST /api/auth/login  -> log in a normal user
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare entered password with the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = createToken({ id: user.id, role: 'user' });

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, charity_id: user.charity_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ============================================
// POST /api/auth/admin-login  -> log in as admin
// ============================================
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = createToken({ id: admin.id, role: 'admin' });

    res.json({
      message: 'Admin login successful!',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
