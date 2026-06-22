// Handles winners uploading proof screenshots, and admin approving/rejecting them.
// Files are saved locally in /uploads/proofs (simplest approach for a beginner project).

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Configure multer to save uploaded images into uploads/proofs with a unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'proofs'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// ============================================
// POST /api/proofs/:drawResultId -> winner uploads a proof screenshot
// ============================================
router.post('/:drawResultId', verifyToken, upload.single('proof'), async (req, res) => {
  try {
    const { drawResultId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    // Make sure this draw_result actually belongs to the logged-in user
    const checkResult = await db.query(
      `SELECT * FROM draw_results WHERE id = $1 AND user_id = $2`,
      [drawResultId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'You can only upload proof for your own winnings.' });
    }

    // Build the URL path to access this file later
    const imageUrl = `/uploads/proofs/${req.file.filename}`;

    const result = await db.query(
      `INSERT INTO winner_proofs (draw_result_id, proof_image_url, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [drawResultId, imageUrl]
    );

    res.status(201).json({
      message: 'Proof uploaded successfully! Waiting for admin approval.',
      proof: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload proof.' });
  }
});

// ============================================
// GET /api/proofs -> ADMIN ONLY: view all uploaded proofs
// ============================================
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT winner_proofs.*, draw_results.user_id, draw_results.match_count, draw_results.prize_amount,
             users.name AS user_name, users.email AS user_email
      FROM winner_proofs
      JOIN draw_results ON winner_proofs.draw_result_id = draw_results.id
      JOIN users ON draw_results.user_id = users.id
      ORDER BY winner_proofs.uploaded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch proofs.' });
  }
});

// ============================================
// PUT /api/proofs/:id/status -> ADMIN ONLY: approve or reject a proof
// ============================================
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
    }

    const result = await db.query(
      `UPDATE winner_proofs SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Proof not found.' });
    }

    // If approved, automatically create a payment record (status: pending) if one doesn't exist yet
    if (status === 'approved') {
      const proof = result.rows[0];

      const existingPayment = await db.query(
        `SELECT * FROM payments WHERE draw_result_id = $1`,
        [proof.draw_result_id]
      );

      if (existingPayment.rows.length === 0) {
        const drawResult = await db.query(
          `SELECT * FROM draw_results WHERE id = $1`,
          [proof.draw_result_id]
        );

        await db.query(
          `INSERT INTO payments (draw_result_id, amount, status) VALUES ($1, $2, 'pending')`,
          [proof.draw_result_id, drawResult.rows[0].prize_amount]
        );
      }
    }

    res.json({ message: `Proof ${status} successfully.`, proof: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update proof status.' });
  }
});

module.exports = router;
