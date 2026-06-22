// Handles everything related to charities:
// - anyone can view the list of charities
// - logged-in users can change which charity they support
// - admin can add/edit/delete charities (admin-only routes are protected)

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ============================================
// GET /api/charities -> list all charities (public, anyone can view)
// ============================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM charities ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch charities.' });
  }
});

// ============================================
// PUT /api/charities/select -> logged-in user changes their selected charity
// ============================================
router.put('/select', verifyToken, async (req, res) => {
  try {
    const { charity_id } = req.body;

    if (!charity_id) {
      return res.status(400).json({ message: 'charity_id is required.' });
    }

    // Make sure the charity actually exists
    const charityCheck = await db.query('SELECT id FROM charities WHERE id = $1', [charity_id]);
    if (charityCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Charity not found.' });
    }

    await db.query('UPDATE users SET charity_id = $1 WHERE id = $2', [charity_id, req.user.id]);

    res.json({ message: 'Charity updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update charity.' });
  }
});

// ============================================
// ADMIN-ONLY: Add / Edit / Delete charities
// ============================================

// POST /api/charities -> add a new charity
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, donation_percentage } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Charity name is required.' });
    }

    const result = await db.query(
      `INSERT INTO charities (name, description, donation_percentage)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description || '', donation_percentage || 10]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add charity.' });
  }
});

// PUT /api/charities/:id -> edit a charity
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, donation_percentage } = req.body;

    const result = await db.query(
      `UPDATE charities SET name = $1, description = $2, donation_percentage = $3
       WHERE id = $4 RETURNING *`,
      [name, description, donation_percentage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Charity not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update charity.' });
  }
});

// DELETE /api/charities/:id -> remove a charity
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM charities WHERE id = $1', [id]);
    res.json({ message: 'Charity deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete charity.' });
  }
});

module.exports = router;
