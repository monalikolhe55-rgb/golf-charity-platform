// This middleware checks if a valid JWT token was sent with the request.
// If valid, it attaches the user's info to req.user so route handlers can use it.
// If invalid/missing, it blocks the request with a 401 error.

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  // The frontend sends the token like this: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    // decoded contains whatever we put in the token when it was created (id, role, etc.)
    req.user = decoded;
    next(); // move on to the actual route handler
  });
}

// Extra middleware to make sure ONLY an admin can access certain routes
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin };
