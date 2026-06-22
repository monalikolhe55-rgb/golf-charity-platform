// One single endpoint that gathers everything the User Dashboard needs:
// profile, subscription status, selected charity, latest scores,
// draw participation history, and winnings history.
// This keeps the frontend simple - just one API call to load the whole dashboard.

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Profile + selected charity (joined together)
    const userResult = await db.query(
      `SELECT users.id, users.name, users.email, users.created_at,
              charities.id AS charity_id, charities.name AS charity_name,
              charities.donation_percentage
       FROM users
       LEFT JOIN charities ON users.charity_id = charities.id
       WHERE users.id = $1`,
      [userId]
    );
    const profile = userResult.rows[0];

    // 2. Subscription status (most recent one)
    const subResult = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    const subscription = subResult.rows[0] || null;

    // 3. Latest scores, newest first
    const scoresResult = await db.query(
      `SELECT * FROM scores WHERE user_id = $1 ORDER BY score_date DESC`,
      [userId]
    );

    // 4. Draw participation + winnings history (every draw_result row for this user)
    const drawHistoryResult = await db.query(
      `SELECT draw_results.*, draws.draw_date, draws.winning_numbers
       FROM draw_results
       JOIN draws ON draw_results.draw_id = draws.id
       WHERE draw_results.user_id = $1
       ORDER BY draws.draw_date DESC`,
      [userId]
    );

    res.json({
      profile,
      subscription,
      scores: scoresResult.rows,
      drawHistory: drawHistoryResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
});

module.exports = router;
