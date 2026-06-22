// Handles golf score management:
// - Add a score (1-45) for a specific date, one score per date
// - Automatically keeps only the latest 5 scores per user (oldest deleted when a 6th is added)
// - Get scores, newest first

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const requireActiveSubscription = require('../middleware/subscriptionCheck');

// ============================================
// GET /api/scores -> get logged-in user's scores, newest first
// ============================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM scores WHERE user_id = $1 ORDER BY score_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch scores.' });
  }
});

// ============================================
// POST /api/scores -> add a new score (requires active subscription)
// ============================================
router.post('/', verifyToken, requireActiveSubscription, async (req, res) => {
  try {
    const { score, score_date } = req.body;

    // Validate score is a number between 1 and 45
    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ message: 'Score must be a number between 1 and 45.' });
    }

    if (!score_date) {
      return res.status(400).json({ message: 'A date is required for the score.' });
    }

    // Check if a score already exists for this date (one score per date rule)
    const existing = await db.query(
      `SELECT id FROM scores WHERE user_id = $1 AND score_date = $2`,
      [req.user.id, score_date]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'You already added a score for this date.' });
    }

    // Insert the new score
    await db.query(
      `INSERT INTO scores (user_id, score, score_date) VALUES ($1, $2, $3)`,
      [req.user.id, score, score_date]
    );

    // ---- KEEP ONLY LATEST 5 SCORES RULE ----
    // Count how many scores this user has now
    const countResult = await db.query(
      `SELECT COUNT(*) FROM scores WHERE user_id = $1`,
      [req.user.id]
    );
    const totalScores = parseInt(countResult.rows[0].count);

    if (totalScores > 5) {
      // Find and delete the oldest score(s) beyond the latest 5
      await db.query(
        `DELETE FROM scores
         WHERE id IN (
           SELECT id FROM scores
           WHERE user_id = $1
           ORDER BY score_date ASC
           LIMIT $2
         )`,
        [req.user.id, totalScores - 5]
      );
    }

    // Return the updated list of scores (newest first)
    const updatedScores = await db.query(
      `SELECT * FROM scores WHERE user_id = $1 ORDER BY score_date DESC`,
      [req.user.id]
    );

    res.status(201).json({
      message: 'Score added successfully!',
      scores: updatedScores.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add score.' });
  }
});

module.exports = router;
