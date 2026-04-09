# FinPsych – AI Financial Behavior Analyzer

> **An intelligent fintech application that goes beyond expense tracking — it understands the psychology behind your spending.**

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Stack](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![Stack](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)

---

## 🧠 What Makes FinPsych Unique

FinPsych is not a basic expense tracker. It features a custom **AI Behavior Analysis Engine** built in Node.js that:

| Feature | How It Works |
|---|---|
| **Impulsive Spending Detection** | Time-cluster algorithm: flags 3+ transactions within a 2-hour window |
| **Weekend vs Weekday Analysis** | Per-transaction average comparison with 30% threshold rule |
| **Salary Cycle Spike Detection** | Compares spending rate in days 1–5 post-salary vs rest of month |
| **Financial Personality Classifier** | Multi-factor weighted scoring → Saver / Spender / Balanced / Risk Taker |
| **Predictive Balance** | Linear burn-rate extrapolation to forecast month-end savings |
| **Smart Human Insights** | Auto-generates natural language alerts from all behavioral signals |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 ([download](https://nodejs.org))
- **MongoDB** running locally OR a MongoDB Atlas URI
  - Local: Install MongoDB Community and run `mongod`
  - Atlas: [Free tier at cloud.mongodb.com](https://cloud.mongodb.com)

---

### Step 1 – Clone & Configure Backend

```bash
cd finpsych/backend

# Copy and edit environment variables
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finpsych
JWT_SECRET=choose_a_long_random_secret_string_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Install dependencies and start:
```bash
npm install
npm run dev
# Server running at http://localhost:5000
# Test: http://localhost:5000/api/health
```

---

### Step 2 – Seed Demo Data (Optional but Recommended)

```bash
# From the backend directory:
node seed.js
```

This creates:
- Demo user: `demo@finpsych.ai` / `demo123456`
- ~200 realistic transactions across 3 months
- Weekend spending bursts, salary-cycle spikes, and impulsive patterns
- Pre-set budget limits and financial personality

---

### Step 3 – Start Frontend

```bash
cd finpsych/frontend
npm install
npm run dev
# App running at http://localhost:5173
```

Open `http://localhost:5173` in your browser. Sign up or use demo credentials.

---

## 📁 Project Structure

```
finpsych/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        JWT auth (signup / login / profile)
│   │   ├── transactionController.js CRUD + CSV import + impulsive re-detection
│   │   ├── analyticsController.js   Dashboard AI analysis + 6-month trends
│   │   └── budgetController.js      Budget CRUD with dynamic AI suggestions
│   ├── middleware/
│   │   └── auth.js                  JWT protect middleware
│   ├── models/
│   │   ├── User.js                  User schema (income, salaryDate, personality)
│   │   └── Transaction.js           Transaction schema (isImpulsive, emotionalScore)
│   ├── routes/
│   │   ├── auth.js                  POST /signup, POST /login, GET /me
│   │   ├── transactions.js          GET/POST/PUT/DELETE + CSV import
│   │   ├── analytics.js             GET /dashboard, GET /trends
│   │   └── budget.js                GET/PUT /budget
│   ├── utils/
│   │   └── aiEngine.js              ← CORE AI ENGINE (8 analysis functions)
│   ├── server.js
│   ├── seed.js                      Demo data generator
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/AuthContext.jsx   Global JWT state
        ├── utils/
        │   ├── api.js                Axios with auth interceptors
        │   └── helpers.js            Formatters, category configs
        ├── pages/
        │   ├── LoginPage.jsx         Split-panel premium login
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx     Main analytics dashboard
        │   ├── TransactionsPage.jsx  CRUD table + CSV import
        │   ├── InsightsPage.jsx      AI behavior deep-dive
        │   ├── BudgetPage.jsx        Category budget planner
        │   └── ProfilePage.jsx       Profile + AI engine status
        ├── components/
        │   ├── ui/
        │   │   ├── AppLayout.jsx     Sidebar navigation
        │   │   └── LoadingScreen.jsx
        │   ├── dashboard/
        │   │   ├── StatCard.jsx
        │   │   ├── PersonalityCard.jsx
        │   │   ├── InsightCard.jsx
        │   │   └── BudgetAlert.jsx
        │   └── expenses/
        │       └── TransactionModal.jsx
        ├── App.jsx                   Router + protected routes
        ├── index.css                 Glass morphism + animations
        └── main.jsx
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile settings |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated, filterable) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| POST | `/api/transactions/import-csv` | Import CSV file |

### Analytics (AI Engine)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Full AI analysis dashboard |
| GET | `/api/analytics/trends?months=6` | Historical monthly trends |

### Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget` | Get budgets + spending + AI suggestions |
| PUT | `/api/budget` | Update monthly + category budgets |

---

## 📊 CSV Import Format

```csv
type,amount,category,description,date
expense,450,Food & Dining,Lunch at office,2024-01-15
income,75000,Income,Monthly Salary,2024-01-01
expense,1299,Entertainment,Netflix subscription,2024-01-05
expense,850,Travel,Uber to airport,2024-01-10
```

**Supported categories:** Food & Dining, Shopping, Travel, Entertainment, Bills & Utilities, Healthcare, Education, Groceries, Fitness, Personal Care, Investments, Income, Other

---

## 🎨 UI Features

- **Dark theme** with glassmorphism cards
- **Framer Motion** animations — stagger reveals, spring transitions, micro-interactions
- **Recharts** — Area chart, Pie chart, Bar chart, Radar chart
- **Responsive** — Sidebar on desktop, slide-out drawer on mobile
- **Custom fonts** — Syne (display) + DM Sans (body) + JetBrains Mono
- **Impulsive badge** — yellow ⚡ tag on detected impulsive transactions
- **Real-time budget bar** — animated progress showing monthly usage

---

## 🧬 AI Engine Deep Dive

The entire AI engine lives in `backend/utils/aiEngine.js` with zero external AI dependencies — it's pure statistical analysis:

### Impulsive Spending Detection
```
Algorithm: Time-Clustering
- Group transactions by calendar day
- Sort by timestamp
- Sliding window of 3: if t[i+2] - t[i] ≤ 2 hours → all 3 flagged as impulsive
- Additional rule: 3+ transactions < ₹500 in Shopping/Entertainment on same day
- Output: isImpulsive: true, emotionalScore: 0.6–1.0
```

### Financial Personality Classifier
```
Inputs: saving ratio, luxury ratio, impulsive ratio, transaction frequency
Scoring matrix (points allocated to each personality):
  - savingRatio > 0.4    → +3 Saver
  - luxuryRatio > 0.5    → +2 Spender, +1 Risk Taker
  - impulsiveRatio > 0.4 → +2 Spender, +2 Risk Taker
  - txnPerMonth > 30     → +1 Spender
Winner = highest total score
```

### Month-End Prediction
```
dailyBurnRate = totalSpentSoFar / dayOfMonth
projectedAdditional = dailyBurnRate × daysRemaining
projectedBalance = monthlyIncome - (totalSpentSoFar + projectedAdditional)
trend = compare first-half vs second-half daily rate
```

---

## 🔮 Future Improvements

1. **Real ML Model** — Train TensorFlow.js on spending datasets for better classification
2. **Bank Integration** — Plaid / Razorpay / UPI auto-import
3. **Email Alerts** — Nodemailer integration for budget breach notifications
4. **PDF Reports** — Monthly financial report download
5. **Goal Tracking** — Set savings goals with milestone tracking
6. **Social Benchmarking** — Anonymous comparison with similar income brackets
7. **PWA** — Offline-capable progressive web app
8. **Voice Input** — Web Speech API for adding transactions by voice
9. **Multi-account** — Track multiple bank accounts
10. **Investment Suggestions** — SIP/mutual fund recommendations based on personality

---

## 🛡️ Security Notes

- Passwords hashed with `bcryptjs` (salt rounds: 12)
- JWT tokens stored in `localStorage` with 7-day expiry
- All protected routes use `protect` middleware
- Input validation with `express-validator`
- MongoDB injection protected by Mongoose schema validation
- CORS configured for localhost:5173 only

---

## 📝 License

MIT — Built for learning and portfolio purposes.

---

*Built with ❤️ for top-tier engineering interviews*
