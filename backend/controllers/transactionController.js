const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { detectImpulsiveSpending } = require('../utils/aiEngine');
const { parse } = require('csv-parse/sync');

// ─── GET /api/transactions ────────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, category, startDate, endDate, sort = '-date' } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/transactions ───────────────────────────────────────────────────
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, tags } = req.body;

    // Basic validation
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'type, amount, and category are required.' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date(),
      tags: tags || [],
    });

    // Re-run impulsive detection for recent transactions
    await runImpulsiveCheck(req.user._id);

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/transactions/:id ────────────────────────────────────────────────
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

    const allowed = ['type', 'amount', 'category', 'description', 'date', 'tags'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });

    await transaction.save();
    await runImpulsiveCheck(req.user._id);

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/transactions/import-csv ───────────────────────────────────────
exports.importCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file required.' });

    const fileContent = req.file.buffer.toString('utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const CATEGORIES = require('../models/Transaction').CATEGORIES;
    const transactions = [];

    for (const row of records) {
      const category = CATEGORIES.includes(row.category) ? row.category : 'Other';
      const type = ['expense', 'income'].includes(row.type?.toLowerCase()) ? row.type.toLowerCase() : 'expense';
      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) continue;

      transactions.push({
        user: req.user._id,
        type,
        amount,
        category,
        description: row.description || '',
        date: row.date ? new Date(row.date) : new Date(),
      });
    }

    const inserted = await Transaction.insertMany(transactions);
    await runImpulsiveCheck(req.user._id);

    res.json({ message: `${inserted.length} transactions imported.`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ message: 'CSV parse error: ' + err.message });
  }
};

// ─── Helper: Re-run impulsive detection on recent 30 days ─────────────────────
async function runImpulsiveCheck(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const recentTxns = await Transaction.find({ user: userId, type: 'expense', date: { $gte: since } });
  if (!recentTxns.length) return;

  const analyzed = detectImpulsiveSpending(recentTxns);

  // Bulk update isImpulsive and emotionalScore
  const bulkOps = analyzed.map((t) => ({
    updateOne: {
      filter: { _id: t._id },
      update: { $set: { isImpulsive: t.isImpulsive, emotionalScore: t.emotionalScore } },
    },
  }));
  await Transaction.bulkWrite(bulkOps);
}
