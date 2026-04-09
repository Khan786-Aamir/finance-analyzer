/**
 * FinPsych Demo Data Seeder
 * Run: node seed.js
 * Creates a demo user with 3 months of realistic transaction data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Inline models (avoid import path issues) ─────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  monthlyIncome: { type: Number, default: 0 }, salaryDate: { type: Number, default: 1 },
  currency: { type: String, default: '₹' },
  financialPersonality: { type: String, default: 'Unknown' },
  monthlyBudget: { type: Number, default: 0 },
  categoryBudgets: { type: Map, of: Number, default: {} },
}, { timestamps: true });

const txSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId, type: String,
  amount: Number, category: String, description: String,
  date: Date, isImpulsive: { type: Boolean, default: false },
  emotionalScore: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

// ─── Realistic transaction templates ─────────────────────────────────────────
const expenseTemplates = [
  { category: 'Food & Dining', items: ['Swiggy order', 'Zomato dinner', 'Office lunch', 'Chai & snacks', 'Restaurant dinner'], range: [80, 800] },
  { category: 'Groceries', items: ['BigBasket order', 'Kirana store', 'D-Mart shopping', 'Vegetable market'], range: [300, 2500] },
  { category: 'Shopping', items: ['Amazon order', 'Flipkart sale', 'Myntra clothes', 'Lifestyle store', 'Decathlon gear'], range: [299, 4999] },
  { category: 'Travel', items: ['Ola cab', 'Uber ride', 'Metro card', 'Flight ticket', 'Petrol'], range: [50, 8000] },
  { category: 'Bills & Utilities', items: ['Electricity bill', 'Internet bill', 'Mobile recharge', 'DTH recharge', 'Gas bill'], range: [199, 3000] },
  { category: 'Entertainment', items: ['Netflix subscription', 'Movie tickets', 'Spotify Premium', 'BookMyShow', 'Gaming'], range: [99, 1200] },
  { category: 'Healthcare', items: ['Pharmacy', 'Doctor consultation', 'Lab test', 'Gym membership'], range: [100, 2500] },
  { category: 'Personal Care', items: ['Salon visit', 'Nykaa order', 'Mamaearth', 'Barbershop'], range: [150, 1500] },
  { category: 'Education', items: ['Udemy course', 'Book purchase', 'Online subscription'], range: [199, 2999] },
];

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransactions(userId, monthsBack = 3) {
  const txns = [];
  const now = new Date();

  for (let m = monthsBack - 1; m >= 0; m--) {
    const year = now.getFullYear();
    const month = now.getMonth() - m;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monthly salary credit on 1st
    txns.push({
      user: userId, type: 'income', amount: 75000,
      category: 'Income', description: 'Monthly Salary - TechCorp Pvt Ltd',
      date: new Date(year, month, 1, 10, 0, 0), isImpulsive: false, emotionalScore: 0,
    });

    // Freelance income (some months)
    if (Math.random() > 0.4) {
      txns.push({
        user: userId, type: 'income', amount: randomBetween(5000, 20000),
        category: 'Income', description: 'Freelance project payment',
        date: new Date(year, month, randomBetween(10, 20), 14, 0, 0),
        isImpulsive: false, emotionalScore: 0,
      });
    }

    // Regular daily expenses (15-20 per month)
    const dailyCount = randomBetween(15, 22);
    for (let d = 0; d < dailyCount; d++) {
      const template = randomItem(expenseTemplates);
      const day = randomBetween(1, daysInMonth);
      const hour = randomBetween(8, 22);
      txns.push({
        user: userId, type: 'expense',
        amount: randomBetween(template.range[0], template.range[1]),
        category: template.category,
        description: randomItem(template.items),
        date: new Date(year, month, day, hour, randomBetween(0, 59), 0),
        isImpulsive: false, emotionalScore: Math.random() * 0.3,
      });
    }

    // Weekend splurge cluster (Saturday afternoon — simulates impulsive behavior)
    // Find a Saturday in this month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d.getDay() === 6 && Math.random() > 0.3) {
        // Impulsive shopping burst — 3 transactions within 2 hours
        const baseHour = 14;
        [0, 45, 90].forEach(minOffset => {
          txns.push({
            user: userId, type: 'expense',
            amount: randomBetween(200, 800),
            category: randomItem(['Shopping', 'Entertainment', 'Food & Dining']),
            description: randomItem(['Online impulse buy', 'Snack run', 'App purchase', 'Grab & go', 'Quick buy']),
            date: new Date(year, month, day, baseHour, minOffset, 0),
            isImpulsive: true, emotionalScore: parseFloat((0.6 + Math.random() * 0.4).toFixed(2)),
          });
        });
        break; // Only one weekend burst per month
      }
    }

    // Post-salary big spend (days 1-5)
    txns.push({
      user: userId, type: 'expense',
      amount: randomBetween(3000, 12000),
      category: randomItem(['Shopping', 'Entertainment', 'Travel']),
      description: randomItem(['New gadget purchase', 'Weekend trip booking', 'Big Amazon order', 'Restaurant dinner with friends']),
      date: new Date(year, month, randomBetween(1, 5), 20, 0, 0),
      isImpulsive: false, emotionalScore: 0.4,
    });

    // EMI / recurring bills
    ['Rent payment', 'Home loan EMI'].forEach(desc => {
      if (Math.random() > 0.5) {
        txns.push({
          user: userId, type: 'expense', amount: randomBetween(8000, 20000),
          category: 'Bills & Utilities', description: desc,
          date: new Date(year, month, 5, 9, 0, 0),
          isImpulsive: false, emotionalScore: 0,
        });
      }
    });
  }

  return txns;
}

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finpsych');
    console.log('✅ Connected to MongoDB');

    // Clear demo user if exists
    const existing = await User.findOne({ email: 'demo@finpsych.ai' });
    if (existing) {
      await Transaction.deleteMany({ user: existing._id });
      await User.deleteOne({ _id: existing._id });
      console.log('🧹 Cleared existing demo data');
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123456', 12);
    const user = await User.create({
      name: 'Arjun Sharma',
      email: 'demo@finpsych.ai',
      password: hashedPassword,
      monthlyIncome: 75000,
      salaryDate: 1,
      currency: '₹',
      financialPersonality: 'Balanced',
      monthlyBudget: 55000,
      categoryBudgets: new Map([
        ['Food & Dining', 6000],
        ['Groceries', 5000],
        ['Shopping', 5000],
        ['Travel', 4000],
        ['Entertainment', 2000],
        ['Bills & Utilities', 8000],
      ]),
    });

    console.log(`👤 Demo user created: ${user.email}`);

    // Generate and insert transactions
    const txns = generateTransactions(user._id, 3);
    await Transaction.insertMany(txns);

    console.log(`💳 ${txns.length} transactions seeded`);
    console.log('\n✨ Demo credentials:');
    console.log('   Email:    demo@finpsych.ai');
    console.log('   Password: demo123456');
    console.log('\n🚀 Start the app: npm run dev (in both backend and frontend)\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
