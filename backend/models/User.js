const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password in queries
    },
    // Monthly income for salary-cycle analysis
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    // Salary credit date (1-31)
    salaryDate: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },
    currency: {
      type: String,
      default: '₹',
    },
    // Financial personality (computed by AI engine)
    financialPersonality: {
      type: String,
      enum: ['Saver', 'Spender', 'Balanced', 'Risk Taker', 'Unknown'],
      default: 'Unknown',
    },
    // Monthly budget limit
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    // Budget per category
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
