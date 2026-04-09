const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, monthlyIncome, salaryDate } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password, monthlyIncome, salaryDate });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        salaryDate: user.salaryDate,
        currency: user.currency,
        financialPersonality: user.financialPersonality,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        salaryDate: user.salaryDate,
        currency: user.currency,
        financialPersonality: user.financialPersonality,
        monthlyBudget: user.monthlyBudget,
        categoryBudgets: Object.fromEntries(user.categoryBudgets || new Map()),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    monthlyIncome: user.monthlyIncome,
    salaryDate: user.salaryDate,
    currency: user.currency,
    financialPersonality: user.financialPersonality,
    monthlyBudget: user.monthlyBudget,
    categoryBudgets: Object.fromEntries(user.categoryBudgets || new Map()),
  });
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, monthlyIncome, salaryDate, currency } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (monthlyIncome !== undefined) updates.monthlyIncome = monthlyIncome;
    if (salaryDate) updates.salaryDate = salaryDate;
    if (currency) updates.currency = currency;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
