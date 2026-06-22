// This middleware blocks access to a route unless the logged-in user
// has an active (non-expired) subscription. Used for features like adding scores.

const db = require('../config/db');

async function requireActiveSubscription(req, res, next) {
  try {
    const result = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [req.user.id]
    );

    const subscription = result.rows[0];

    if (!subscription) {
      return res.status(403).json({ message: 'You need an active subscription to use this feature.' });
    }

    // If subscription has expired by date but status wasn't updated yet, treat it as expired
    const isExpired = new Date(subscription.end_date) < new Date();

    if (subscription.status !== 'active' || isExpired) {
      return res.status(403).json({ message: 'Your subscription has expired. Please renew to continue.' });
    }

    next(); // subscription is active, allow the request through
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify subscription status.' });
  }
}

module.exports = requireActiveSubscription;
