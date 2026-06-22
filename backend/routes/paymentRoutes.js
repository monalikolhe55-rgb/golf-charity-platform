// Handles payment status tracking: Pending -> Approved -> Paid
// (Approved status is set automatically when admin approves the proof - see proofRoutes.js)
// This file handles viewing payments and marking them as "paid".

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ============================================
// GET /api/payments -> ADMIN ONLY: view all payments
// ============================================
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT payments.*, draw_results.user_id, draw_results.match_count,
             users.name AS user_name, users.email AS user_email
      FROM payments
      JOIN draw_results ON payments.draw_result_id = draw_results.id
      JOIN users ON draw_results.user_id = users.id
      ORDER BY payments.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payments.' });
  }
});

// ============================================
// PUT /api/payments/:id/pay -> ADMIN ONLY: mark a payment as "paid"
// ============================================
router.put('/:id/pay', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    res.json({ message: 'Payment marked as paid!', payment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update payment.' });
  }
});

module.exports = router;
