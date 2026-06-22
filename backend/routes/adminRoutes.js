// Admin-only routes for managing users and viewing platform-wide reports.

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// All routes in this file require the user to be logged in AND be an admin
router.use(verifyToken, verifyAdmin);

// ============================================
// GET /api/admin/users -> view all users
// ============================================
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT users.id, users.name, users.email, users.created_at,
             charities.name AS charity_name
      FROM users
      LEFT JOIN charities ON users.charity_id = charities.id
      ORDER BY users.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// ============================================
// PUT /api/admin/users/:id -> edit a user's basic details
// ============================================
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, charity_id } = req.body;

    const result = await db.query(
      `UPDATE users SET name = $1, email = $2, charity_id = $3 WHERE id = $4 RETURNING id, name, email, charity_id`,
      [name, email, charity_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User updated successfully!', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// ============================================
// DELETE /api/admin/users/:id -> delete a user
// ============================================
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// ============================================
// GET /api/admin/reports -> platform-wide statistics
// ============================================
router.get('/reports', async (req, res) => {
  try {
    // Total users
    const totalUsersResult = await db.query('SELECT COUNT(*) FROM users');

    // Active subscriptions (status active AND end_date in the future)
    const activeSubsResult = await db.query(
      `SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND end_date > NOW()`
    );

    // Total prize pool ever given out (sum of all draws' prize_pool)
    const totalPrizePoolResult = await db.query('SELECT COALESCE(SUM(prize_pool), 0) AS total FROM draws');

    // Total amount actually distributed to winners
    const totalDistributedResult = await db.query(
      'SELECT COALESCE(SUM(prize_amount), 0) AS total FROM draw_results'
    );

    // Charity contributions: for each charity, sum up (donation_percentage% of each of their supporters' winnings)
    // Simplest approach: total winnings of users grouped by their selected charity, then apply percentage
    const charityContributionsResult = await db.query(`
      SELECT charities.id, charities.name, charities.donation_percentage,
             COALESCE(SUM(draw_results.prize_amount), 0) AS total_winnings_by_supporters
      FROM charities
      LEFT JOIN users ON users.charity_id = charities.id
      LEFT JOIN draw_results ON draw_results.user_id = users.id
      GROUP BY charities.id, charities.name, charities.donation_percentage
      ORDER BY charities.id
    `);

    // Calculate actual donation amount per charity (percentage of their supporters' total winnings)
    const charityContributions = charityContributionsResult.rows.map((row) => ({
      ...row,
      donation_amount: (
        (parseFloat(row.total_winnings_by_supporters) * row.donation_percentage) /
        100
      ).toFixed(2),
    }));

    // Draw statistics: total draws run, total winners across all draws
    const totalDrawsResult = await db.query('SELECT COUNT(*) FROM draws');
    const totalWinnersResult = await db.query('SELECT COUNT(*) FROM draw_results');

    res.json({
      totalUsers: parseInt(totalUsersResult.rows[0].count),
      activeSubscriptions: parseInt(activeSubsResult.rows[0].count),
      totalPrizePool: parseFloat(totalPrizePoolResult.rows[0].total),
      totalDistributed: parseFloat(totalDistributedResult.rows[0].total),
      charityContributions,
      totalDraws: parseInt(totalDrawsResult.rows[0].count),
      totalWinners: parseInt(totalWinnersResult.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate reports.' });
  }
});

module.exports = router;
