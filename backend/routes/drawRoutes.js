// This is the core "lottery" logic of the platform.
//
// HOW IT WORKS:
// 1. Admin clicks "Run Draw"
// 2. System generates 5 random numbers (1-45, like the score range)
// 3. System looks at EVERY user's latest scores and counts how many of their
//    scores match the winning numbers
// 4. Users with 3, 4, or 5 matches are winners
// 5. Prize pool (₹100,000) is split: 5-match get 40%, 4-match get 35%, 3-match get 25%
// 6. Each prize tier is split EQUALLY among all winners in that tier
// 7. If nobody gets 5 matches, that 40% "jackpot" rolls over (we just note it - 
//    simplest version: it's not added anywhere yet, just flagged)

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const PRIZE_POOL = 100000; // ₹100,000 fixed prize pool, as per requirements

// Helper: generate 5 unique random numbers between 1 and 45
function generateWinningNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    const randomNum = Math.floor(Math.random() * 45) + 1; // 1 to 45
    numbers.add(randomNum);
  }
  return Array.from(numbers);
}

// Helper: count how many of a user's scores match the winning numbers
function countMatches(userScores, winningNumbers) {
  let matches = 0;
  for (const userScore of userScores) {
    if (winningNumbers.includes(userScore)) {
      matches++;
    }
  }
  return matches;
}

// ============================================
// POST /api/draws/run -> ADMIN ONLY: run a new draw
// ============================================
router.post('/run', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Step 1: generate the 5 winning numbers
    const winningNumbers = generateWinningNumbers();

    // Step 2: get every user along with their current scores
    const usersResult = await db.query(`
      SELECT users.id AS user_id, scores.score
      FROM users
      LEFT JOIN scores ON scores.user_id = users.id
    `);

    // Group scores by user_id, e.g. { 1: [12, 30, 45], 2: [5, 10] }
    const userScoresMap = {};
    for (const row of usersResult.rows) {
      if (!userScoresMap[row.user_id]) userScoresMap[row.user_id] = [];
      if (row.score !== null) userScoresMap[row.user_id].push(row.score);
    }

    // Step 3: figure out match count for each user, and group winners by tier
    const winnersByTier = { 5: [], 4: [], 3: [] };

    for (const userId in userScoresMap) {
      const matches = countMatches(userScoresMap[userId], winningNumbers);
      if (matches === 5 || matches === 4 || matches === 3) {
        winnersByTier[matches].push(userId);
      }
    }

    // Step 4: work out prize pool split
    const hasFiveMatchWinners = winnersByTier[5].length > 0;
    const jackpotRolledOver = !hasFiveMatchWinners;

    // If nobody got 5 matches, the 40% jackpot share simply rolls over (not distributed this round)
    const fiveMatchPool = hasFiveMatchWinners ? PRIZE_POOL * 0.40 : 0;
    const fourMatchPool = PRIZE_POOL * 0.35;
    const threeMatchPool = PRIZE_POOL * 0.25;

    // Step 5: save the draw record first, so we have a draw_id to attach results to
    const drawInsert = await db.query(
      `INSERT INTO draws (winning_numbers, prize_pool, jackpot_rolled_over)
       VALUES ($1, $2, $3) RETURNING *`,
      [winningNumbers, PRIZE_POOL, jackpotRolledOver]
    );
    const draw = drawInsert.rows[0];

    // Step 6: split each tier's pool equally among its winners, and save each result
    const allResults = [];

    const tierPools = { 5: fiveMatchPool, 4: fourMatchPool, 3: threeMatchPool };

    for (const tier of [5, 4, 3]) {
      const winners = winnersByTier[tier];
      if (winners.length === 0) continue; // no winners in this tier, skip

      const prizePerWinner = tierPools[tier] / winners.length;

      for (const userId of winners) {
        const resultInsert = await db.query(
          `INSERT INTO draw_results (draw_id, user_id, match_count, prize_amount)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [draw.id, userId, tier, prizePerWinner.toFixed(2)]
        );
        allResults.push(resultInsert.rows[0]);
      }
    }

    res.status(201).json({
      message: 'Draw completed successfully!',
      draw,
      results: allResults,
      summary: {
        fiveMatchWinners: winnersByTier[5].length,
        fourMatchWinners: winnersByTier[4].length,
        threeMatchWinners: winnersByTier[3].length,
        jackpotRolledOver,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to run draw.' });
  }
});

// ============================================
// GET /api/draws -> view all past draws (anyone logged in can view results)
// ============================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM draws ORDER BY draw_date DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch draws.' });
  }
});

// ============================================
// GET /api/draws/:id/results -> view results (winners) for one specific draw
// ============================================
router.get('/:id/results', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT draw_results.*, users.name AS user_name, users.email AS user_email
       FROM draw_results
       JOIN users ON draw_results.user_id = users.id
       WHERE draw_results.draw_id = $1
       ORDER BY draw_results.match_count DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch draw results.' });
  }
});

module.exports = router;
