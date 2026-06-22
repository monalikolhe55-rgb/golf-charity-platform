// Handles subscriptions: user picks monthly/yearly plan, we store start/end dates and status.
// Note: This is a SIMPLE simulation - there's no real payment gateway here.
// Subscribing instantly activates the plan (perfect for an internship/demo project).

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================
// GET /api/subscriptions/me -> get logged-in user's current subscription
// ============================================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ subscription: null }); // user has never subscribed
    }

    const subscription = result.rows[0];

    // Auto-check: if end_date has passed, mark it as expired before sending back
    if (new Date(subscription.end_date) < new Date() && subscription.status === 'active') {
      await db.query('UPDATE subscriptions SET status = $1 WHERE id = $2', ['expired', subscription.id]);
      subscription.status = 'expired';
    }

    res.json({ subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch subscription.' });
  }
});

// ============================================
// POST /api/subscriptions -> subscribe to a plan (monthly or yearly)
// ============================================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { plan_type } = req.body; // 'monthly' or 'yearly'

    if (!['monthly', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ message: 'plan_type must be "monthly" or "yearly".' });
    }

    // Work out the end date based on plan type
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan_type === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const result = await db.query(
      `INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date)
       VALUES ($1, $2, 'active', $3, $4) RETURNING *`,
      [req.user.id, plan_type, startDate, endDate]
    );

    res.status(201).json({
      message: `Subscribed to the ${plan_type} plan successfully!`,
      subscription: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to subscribe.' });
  }
});

module.exports = router;
