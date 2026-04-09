const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ─── GET /api/budget ──────────────────────────────────────────────────────────
exports.getBudget = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentTxns = await Transaction.find({
      user: user._id,
      type: 'expense',
      date: { $gte: start },
    });

    const spentByCategory = {};
    currentTxns.forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
    });

    const totalSpent = currentTxns.reduce((s, t) => s + t.amount, 0);

    // Dynamic suggestions: based on avg of last 3 months
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const historicalTxns = await Transaction.find({
      user: user._id,
      type: 'expense',
      date: { $gte: threeMonthsAgo, $lt: start },
    });

    const historicalByCategory = {};
    historicalTxns.forEach((t) => {
      if (!historicalByCategory[t.category]) historicalByCategory[t.category] = [];
      historicalByCategory[t.category].push(t.amount);
    });

    const suggestions = {};
    Object.entries(historicalByCategory).forEach(([cat, amounts]) => {
      const avg = amounts.reduce((s, a) => s + a, 0) / 3; // 3 months
      suggestions[cat] = Math.round(avg * 1.1); // 10% buffer above historical avg
    });

    res.json({
      monthlyBudget: user.monthlyBudget || 0,
      categoryBudgets: Object.fromEntries(user.categoryBudgets || new Map()),
      totalSpent: Math.round(totalSpent),
      spentByCategory: Object.fromEntries(
        Object.entries(spentByCategory).map(([k, v]) => [k, Math.round(v)])
      ),
      suggestions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/budget ──────────────────────────────────────────────────────────
exports.updateBudget = async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;
    const updates = {};
    if (monthlyBudget !== undefined) updates.monthlyBudget = parseFloat(monthlyBudget);
    if (categoryBudgets) updates.categoryBudgets = new Map(Object.entries(categoryBudgets));

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      monthlyBudget: user.monthlyBudget,
      categoryBudgets: Object.fromEntries(user.categoryBudgets || new Map()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
