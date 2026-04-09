const Transaction = require('../models/Transaction');
const User = require('../models/User');
const {
  analyzeWeekendVsWeekday,
  analyzeSalaryCycleSpending,
  analyzeCategoryBreakdown,
  compareMonths,
  classifyFinancialPersonality,
  predictEndOfMonth,
  generateInsights,
  getDailySpendingTrend,
  detectImpulsiveSpending,
} = require('../utils/aiEngine');

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    // Current month range
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Last month range
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentTxns, lastTxns, allTxns] = await Promise.all([
      Transaction.find({ user: user._id, date: { $gte: currentStart, $lte: currentEnd } }),
      Transaction.find({ user: user._id, date: { $gte: lastStart, $lte: lastEnd } }),
      Transaction.find({ user: user._id }).sort({ date: -1 }).limit(200),
    ]);

    // Run impulsive detection
    const analyzedTxns = detectImpulsiveSpending(currentTxns);
    const impulsiveCount = analyzedTxns.filter((t) => t.isImpulsive).length;

    // Core computations
    const totalIncome = currentTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = currentTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const weekendAnalysis = analyzeWeekendVsWeekday(allTxns);
    const salaryCycle = analyzeSalaryCycleSpending(allTxns, user.salaryDate);
    const categoryBreakdown = analyzeCategoryBreakdown(currentTxns);
    const monthComparison = compareMonths(currentTxns, lastTxns);
    const personalityData = classifyFinancialPersonality(analyzedTxns, user.monthlyIncome);
    const prediction = predictEndOfMonth(currentTxns, user.monthlyIncome);
    const dailyTrend = getDailySpendingTrend(allTxns, 30);

    // Update personality in DB (async, don't await)
    User.findByIdAndUpdate(user._id, { financialPersonality: personalityData.personality }).exec();

    // Generate insights
    const insights = generateInsights({
      weekendAnalysis,
      salaryCycle,
      categoryBreakdown,
      monthComparison,
      personality: personalityData.personality,
      prediction,
      impulsiveCount,
      currency: user.currency || '₹',
    });

    // Budget alert
    let budgetAlert = null;
    if (user.monthlyBudget > 0 && totalExpense > user.monthlyBudget * 0.8) {
      budgetAlert = {
        type: totalExpense > user.monthlyBudget ? 'exceeded' : 'warning',
        message:
          totalExpense > user.monthlyBudget
            ? `Budget exceeded! Spent ₹${Math.round(totalExpense).toLocaleString()} of ₹${user.monthlyBudget.toLocaleString()} budget.`
            : `Approaching budget limit. ${Math.round(((totalExpense / user.monthlyBudget) * 100))}% used.`,
        used: Math.round(totalExpense),
        budget: user.monthlyBudget,
        percentage: Math.round((totalExpense / user.monthlyBudget) * 100),
      };
    }

    res.json({
      summary: {
        totalIncome: Math.round(totalIncome),
        totalExpense: Math.round(totalExpense),
        balance: Math.round(balance),
        transactionCount: currentTxns.length,
      },
      weekendAnalysis,
      salaryCycle,
      categoryBreakdown,
      monthComparison,
      personalityData,
      prediction,
      dailyTrend,
      insights,
      budgetAlert,
      impulsiveCount,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/analytics/trends ───────────────────────────────────────────────
exports.getTrends = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const txns = await Transaction.find({ user: req.user._id, date: { $gte: start, $lte: end } });
      const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        expense: Math.round(expense),
        income: Math.round(income),
        savings: Math.round(Math.max(0, income - expense)),
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
