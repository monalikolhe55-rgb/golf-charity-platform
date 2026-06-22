// This is the entry point of our backend server.
// It sets up Express, connects all the route files, and starts listening for requests.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ---- MIDDLEWARE ----
 // allow our React frontend to talk to this backend
          app.use(cors({
  origin: [
    'http://localhost:5173',                                    // for local development
    'https://golf-charity-platform-ycp8-8yc4isyfd.vercel.app', // your Vercel URL
  ],
  credentials: true,
}));
app.use(express.json());   // allow the server to read JSON from request bodies

// Serve uploaded proof images as static files (so the frontend can display them)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- ROUTES ----
// Each feature of the app has its own route file, kept in the /routes folder
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/charities', require('./routes/charityRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/draws', require('./routes/drawRoutes'));
app.use('/api/proofs', require('./routes/proofRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Simple test route to check the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Golf Charity Rewards Platform API is running!' });
});

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
