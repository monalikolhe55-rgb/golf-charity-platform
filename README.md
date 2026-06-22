# ⛳ Golf Charity Rewards Platform

A platform where users subscribe, log golf scores, support charities, and win monthly cash prizes.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT (JSON Web Tokens)

---

## 📁 Project Structure

```
golf-charity-platform/
├── backend/                  # Express API server
│   ├── config/
│   │   ├── db.js             # Database connection
│   │   └── seedAdmin.js      # Creates default admin login
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── subscriptionCheck.js  # Blocks inactive subscribers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── charityRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── scoreRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── drawRoutes.js
│   │   ├── proofRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/proofs/       # Uploaded winner proof screenshots
│   ├── schema.sql            # Run this in Supabase SQL Editor first!
│   ├── server.js             # Entry point
│   └── .env.example          # Copy to .env and fill in your values
│
└── frontend/                 # React app
    └── src/
        ├── api/axios.js          # Shared API client (auto-attaches JWT)
        ├── context/AuthContext.jsx  # Login state management
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Card.jsx
        │   ├── ProtectedRoute.jsx
        │   └── admin/             # Admin panel tab components
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Charities.jsx
        │   ├── Subscription.jsx
        │   ├── Dashboard.jsx
        │   ├── DrawResults.jsx
        │   └── AdminDashboard.jsx
        └── App.jsx            # Routes
```

---

## 🚀 Setup Instructions

### 1. Create your Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Once created, go to **Project Settings → Database → Connection String (URI)** and copy it.
3. Go to **SQL Editor**, paste the contents of `backend/schema.sql`, and click **Run**.
   This creates all 9 tables and adds 3 sample charities.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Now open `.env` and fill in:
- `DATABASE_URL` → your Supabase connection string
- `JWT_SECRET` → any long random string (e.g. `mysecretkey12345`)

Create the default admin login:
```bash
npm run seed-admin
```
This prints the admin email/password to use for logging into `/admin` (default: `admin@golfcharity.com` / `admin123`).

Start the backend:
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`. It's already configured to call the backend at `http://localhost:5000/api` (see `frontend/src/api/axios.js` if you need to change this).

---

## 🧠 How Key Features Work

### Score Rule (latest 5 only)
When a user adds a 6th score, `scoreRoutes.js` automatically deletes the oldest score(s) so only the 5 most recent remain — see the `POST /api/scores` handler.

### Draw System
`drawRoutes.js` → `POST /api/draws/run`:
1. Generates 5 unique random numbers (1–45).
2. Compares them against every user's stored scores.
3. Groups users into 3-match / 4-match / 5-match winners.
4. Splits the ₹100,000 prize pool: 40% / 35% / 25% across those tiers, divided equally among winners in each tier.
5. If no one gets 5 matches, that 40% share is simply not distributed this round (`jackpot_rolled_over = true`).

### Subscription Restriction
`middleware/subscriptionCheck.js` blocks the "add score" route unless the user has an active, non-expired subscription.

### Winner Verification Flow
`Pending → Approved → Paid`
1. Winner uploads a screenshot via `POST /api/proofs/:drawResultId`.
2. Admin approves/rejects via `PUT /api/proofs/:id/status`. Approving auto-creates a `payments` row.
3. Admin marks it paid via `PUT /api/payments/:id/pay`.

---

## 🔑 Default Logins (after running schema.sql + seed-admin)
- **Admin**: `admin@golfcharity.com` / `admin123`
- **Users**: register your own via the Register page

---

## 📝 Notes for Beginners
- Every route file is commented to explain what it does.
- The backend uses plain SQL queries (no ORM) so you can read exactly what each query does.
- The frontend uses one shared `api.js` file for all backend calls — no need to repeat fetch/axios setup in every page.
- Subscriptions in this project are simulated (no real payment gateway) — clicking "Subscribe" instantly activates the plan, which is intentional to keep this project simple and focused on the core logic.
