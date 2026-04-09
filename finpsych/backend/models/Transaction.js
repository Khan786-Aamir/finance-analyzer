const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Travel',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Groceries',
  'Fitness',
  'Personal Care',
  'Investments',
  'Income',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // For impulsive spending detection
    tags: [String],

    // AI-computed fields
    isImpulsive: {
      type: Boolean,
      default: false,
    },
    emotionalScore: {
      // 0–1 scale; higher = more likely emotional/impulsive purchase
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

// Compound index for fast user+date queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.CATEGORIES = CATEGORIES;
