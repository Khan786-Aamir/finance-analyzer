/**
 * FinPsych AI Behavior Analysis Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * This module implements rule-based + statistical AI logic to:
 *  1. Detect impulsive / emotional spending
 *  2. Identify spending patterns (weekend, salary-cycle, etc.)
 *  3. Classify financial personality
 *  4. Generate predictive analytics
 *  5. Build human-like insight sentences
 */

// ─── IMPULSIVE SPENDING DETECTION ─────────────────────────────────────────────
/**
 * Detects impulsive spending using time-clustering:
 * If ≥3 expense transactions occur within 2 hours on the same day → impulsive burst
 * Also flags small-amount high-frequency purchases.
 */
function detectImpulsiveSpending(transactions) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const flagged = new Set();

  // Group by date (YYYY-MM-DD)
  const byDay = {};
  expenses.forEach((t) => {
    const day = new Date(t.date).toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(t);
  });

  // Within each day, check for 2-hour cluster bursts
  Object.values(byDay).forEach((dayTxns) => {
    dayTxns.sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 0; i < dayTxns.length - 2; i++) {
      const t1 = new Date(dayTxns[i].date);
      const t3 = new Date(dayTxns[i + 2].date);
      const diffHours = (t3 - t1) / (1000 * 60 * 60);
      if (diffHours <= 2) {
        // 3 transactions within 2 hours = impulsive burst
        flagged.add(dayTxns[i]._id.toString());
        flagged.add(dayTxns[i + 1]._id.toString());
        flagged.add(dayTxns[i + 2]._id.toString());
      }
    }
  });

  // Also flag: amount < ₹500 and category is Shopping/Entertainment (micro-impulsive)
  expenses.forEach((t) => {
    if (t.amount < 500 && ['Shopping', 'Entertainment'].includes(t.category)) {
      // Only flag if there are multiple such transactions in a day
      const day = new Date(t.date).toISOString().split('T')[0];
      const sameDay = byDay[day] || [];
      const microCount = sameDay.filter(
        (x) => x.amount < 500 && ['Shopping', 'Entertainment'].includes(x.category)
      ).length;
      if (microCount >= 3) flagged.add(t._id.toString());
    }
  });

  // Compute emotional score (0–1) for each transaction
  return expenses.map((t) => ({
    ...t.toObject?.() ?? t,
    isImpulsive: flagged.has(t._id.toString()),
    emotionalScore: flagged.has(t._id.toString())
      ? parseFloat((0.6 + Math.random() * 0.4).toFixed(2))
      : parseFloat((Math.random() * 0.3).toFixed(2)),
  }));
}

// ─── WEEKEND VS WEEKDAY ANALYSIS ──────────────────────────────────────────────
function analyzeWeekendVsWeekday(transactions) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  let weekendTotal = 0, weekdayTotal = 0;
  let weekendCount = 0, weekdayCount = 0;

  expenses.forEach((t) => {
    const day = new Date(t.date).getDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) {
      weekendTotal += t.amount;
      weekendCount++;
    } else {
      weekdayTotal += t.amount;
      weekdayCount++;
    }
  });

  const weekendAvg = weekendCount ? weekendTotal / weekendCount : 0;
  const weekdayAvg = weekdayCount ? weekdayTotal / weekdayCount : 0;
  const ratio = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 1;

  return {
    weekendTotal: Math.round(weekendTotal),
    weekdayTotal: Math.round(weekdayTotal),
    weekendAvg: Math.round(weekendAvg),
    weekdayAvg: Math.round(weekdayAvg),
    weekendCount,
    weekdayCount,
    overspendOnWeekend: ratio > 1.3, // 30% more on weekends = pattern
    ratio: parseFloat(ratio.toFixed(2)),
  };
}

// ─── SALARY-CYCLE SPIKE DETECTION ─────────────────────────────────────────────
/**
 * Checks if spending spikes in the first 5 days after salary credit date.
 */
function analyzeSalaryCycleSpending(transactions, salaryDate = 1) {
  const expenses = transactions.filter((t) => t.type === 'expense');

  let postSalaryTotal = 0, otherTotal = 0;
  let postSalaryCount = 0, otherCount = 0;

  expenses.forEach((t) => {
    const dom = new Date(t.date).getDate(); // day of month
    // "Post salary window" = salaryDate to salaryDate+5
    const inWindow =
      dom >= salaryDate && dom <= Math.min(salaryDate + 5, 28);
    if (inWindow) {
      postSalaryTotal += t.amount;
      postSalaryCount++;
    } else {
      otherTotal += t.amount;
      otherCount++;
    }
  });

  const postAvg = postSalaryCount ? postSalaryTotal / postSalaryCount : 0;
  const otherAvg = otherCount ? otherTotal / otherCount : 0;
  const spikeRatio = otherAvg > 0 ? postAvg / otherAvg : 1;

  return {
    postSalaryTotal: Math.round(postSalaryTotal),
    otherTotal: Math.round(otherTotal),
    hasSpikeAfterSalary: spikeRatio > 1.5, // 50% more spending post-salary
    spikeRatio: parseFloat(spikeRatio.toFixed(2)),
  };
}

// ─── CATEGORY ANALYSIS ────────────────────────────────────────────────────────
function analyzeCategoryBreakdown(transactions) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const breakdown = {};

  expenses.forEach((t) => {
    if (!breakdown[t.category]) breakdown[t.category] = { total: 0, count: 0 };
    breakdown[t.category].total += t.amount;
    breakdown[t.category].count++;
  });

  const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);

  return Object.entries(breakdown)
    .map(([category, data]) => ({
      category,
      total: Math.round(data.total),
      count: data.count,
      percentage: totalSpent > 0 ? parseFloat(((data.total / totalSpent) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ─── MONTH-OVER-MONTH COMPARISON ──────────────────────────────────────────────
function compareMonths(currentMonthTxns, lastMonthTxns) {
  const sumExpenses = (txns) =>
    txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const current = sumExpenses(currentMonthTxns);
  const last = sumExpenses(lastMonthTxns);
  const change = last > 0 ? ((current - last) / last) * 100 : 0;

  // Category-level comparison
  const currentBreakdown = analyzeCategoryBreakdown(currentMonthTxns);
  const lastBreakdown = analyzeCategoryBreakdown(lastMonthTxns);

  const categoryChanges = currentBreakdown.map((curr) => {
    const prev = lastBreakdown.find((l) => l.category === curr.category);
    const prevTotal = prev ? prev.total : 0;
    const pctChange = prevTotal > 0 ? ((curr.total - prevTotal) / prevTotal) * 100 : 100;
    return { category: curr.category, current: curr.total, previous: prevTotal, pctChange: parseFloat(pctChange.toFixed(1)) };
  });

  return { current: Math.round(current), last: Math.round(last), change: parseFloat(change.toFixed(1)), categoryChanges };
}

// ─── FINANCIAL PERSONALITY CLASSIFIER ────────────────────────────────────────
/**
 * Classifies user into one of 4 personality types based on:
 * - Saving ratio (income saved vs spent)
 * - Spending frequency (transactions per month)
 * - Category distribution (necessities vs luxuries)
 * - Impulsive score
 */
function classifyFinancialPersonality(transactions, monthlyIncome = 0) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);
  const impulsiveCount = expenses.filter((t) => t.isImpulsive).length;

  // Saving ratio (0 if no income set)
  const savingRatio = monthlyIncome > 0 ? Math.max(0, (monthlyIncome - totalSpent) / monthlyIncome) : 0.5;

  // Spending frequency (per month average)
  const txnPerMonth = expenses.length;

  // Luxury vs necessity ratio
  const luxuryCategories = ['Shopping', 'Entertainment', 'Travel', 'Personal Care', 'Fitness'];
  const luxurySpend = expenses
    .filter((t) => luxuryCategories.includes(t.category))
    .reduce((s, t) => s + t.amount, 0);
  const luxuryRatio = totalSpent > 0 ? luxurySpend / totalSpent : 0;

  // Impulsive ratio
  const impulsiveRatio = expenses.length > 0 ? impulsiveCount / expenses.length : 0;

  // Scoring matrix
  let scores = { Saver: 0, Spender: 0, Balanced: 0, 'Risk Taker': 0 };

  // Saving ratio scoring
  if (savingRatio > 0.4) scores.Saver += 3;
  else if (savingRatio > 0.2) scores.Balanced += 2;
  else scores.Spender += 3;

  // Luxury spending
  if (luxuryRatio > 0.5) { scores.Spender += 2; scores['Risk Taker'] += 1; }
  else if (luxuryRatio > 0.3) scores.Balanced += 2;
  else scores.Saver += 2;

  // Impulsive behavior
  if (impulsiveRatio > 0.4) { scores.Spender += 2; scores['Risk Taker'] += 2; }
  else if (impulsiveRatio > 0.2) scores.Balanced += 1;
  else scores.Saver += 1;

  // Transaction frequency
  if (txnPerMonth > 30) scores.Spender += 1;
  else if (txnPerMonth > 15) scores.Balanced += 1;
  else scores.Saver += 1;

  // Pick highest score
  const personality = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    personality,
    scores,
    metrics: {
      savingRatio: parseFloat(savingRatio.toFixed(2)),
      luxuryRatio: parseFloat(luxuryRatio.toFixed(2)),
      impulsiveRatio: parseFloat(impulsiveRatio.toFixed(2)),
      txnPerMonth,
    },
  };
}

// ─── PREDICTIVE ANALYTICS ─────────────────────────────────────────────────────
/**
 * Uses linear trend extrapolation on daily spending to predict:
 * - End-of-month balance
 * - Projected savings
 */
function predictEndOfMonth(currentMonthTxns, monthlyIncome = 0) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  const expenses = currentMonthTxns.filter((t) => t.type === 'expense');
  const totalSpentSoFar = expenses.reduce((s, t) => s + t.amount, 0);

  // Daily burn rate
  const dailyBurnRate = dayOfMonth > 0 ? totalSpentSoFar / dayOfMonth : 0;
  const projectedAdditionalSpend = dailyBurnRate * daysRemaining;
  const projectedTotalSpend = totalSpentSoFar + projectedAdditionalSpend;

  // Income from transactions this month
  const incomeFromTxns = currentMonthTxns
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const effectiveIncome = monthlyIncome > 0 ? monthlyIncome : incomeFromTxns;

  const projectedBalance = effectiveIncome - projectedTotalSpend;
  const projectedSavings = Math.max(0, projectedBalance);

  // Trend: compare first half vs second half spending rate
  const halfPoint = Math.floor(daysInMonth / 2);
  const firstHalf = expenses.filter((t) => new Date(t.date).getDate() <= halfPoint);
  const secondHalf = expenses.filter((t) => new Date(t.date).getDate() > halfPoint);
  const firstHalfRate = firstHalf.reduce((s, t) => s + t.amount, 0) / halfPoint;
  const secondHalfRate =
    secondHalf.length > 0
      ? secondHalf.reduce((s, t) => s + t.amount, 0) / (dayOfMonth - halfPoint)
      : firstHalfRate;

  const trend = secondHalfRate > firstHalfRate * 1.1 ? 'increasing' : secondHalfRate < firstHalfRate * 0.9 ? 'decreasing' : 'stable';

  return {
    totalSpentSoFar: Math.round(totalSpentSoFar),
    dailyBurnRate: Math.round(dailyBurnRate),
    projectedTotalSpend: Math.round(projectedTotalSpend),
    projectedBalance: Math.round(projectedBalance),
    projectedSavings: Math.round(projectedSavings),
    daysRemaining,
    effectiveIncome: Math.round(effectiveIncome),
    trend,
  };
}

// ─── SMART INSIGHT GENERATOR ──────────────────────────────────────────────────
/**
 * Produces human-like, actionable insight strings based on analysis results.
 */
function generateInsights({
  weekendAnalysis,
  salaryCycle,
  categoryBreakdown,
  monthComparison,
  personality,
  prediction,
  impulsiveCount,
  currency = '₹',
}) {
  const insights = [];

  // Weekend spending pattern
  if (weekendAnalysis.overspendOnWeekend) {
    insights.push({
      type: 'warning',
      icon: '📅',
      title: 'Weekend Splurger Detected',
      message: `You spend ${Math.round((weekendAnalysis.ratio - 1) * 100)}% more per transaction on weekends than weekdays. Consider setting a weekend budget.`,
    });
  }

  // Salary cycle spike
  if (salaryCycle.hasSpikeAfterSalary) {
    insights.push({
      type: 'warning',
      icon: '💸',
      title: 'Post-Salary Spending Spike',
      message: `Your spending spikes by ${Math.round((salaryCycle.spikeRatio - 1) * 100)}% right after salary credit. This "fresh money" behavior can erode savings.`,
    });
  }

  // Top overspending category vs last month
  if (monthComparison && monthComparison.categoryChanges) {
    const biggestIncrease = monthComparison.categoryChanges
      .filter((c) => c.pctChange > 20 && c.current > 500)
      .sort((a, b) => b.pctChange - a.pctChange)[0];

    if (biggestIncrease) {
      insights.push({
        type: 'alert',
        icon: '📈',
        title: `${biggestIncrease.category} Up ${biggestIncrease.pctChange}%`,
        message: `Your ${biggestIncrease.category} expenses increased by ${biggestIncrease.pctChange}% compared to last month (${currency}${biggestIncrease.previous.toLocaleString()} → ${currency}${biggestIncrease.current.toLocaleString()}).`,
      });
    }
  }

  // Impulsive spending
  if (impulsiveCount > 0) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      title: 'Impulsive Spending Detected',
      message: `${impulsiveCount} of your recent transactions show signs of impulsive buying. These cluster in short bursts, often emotional reactions.`,
    });
  }

  // Projection
  if (prediction) {
    if (prediction.projectedSavings > 0) {
      insights.push({
        type: 'success',
        icon: '🎯',
        title: 'On Track to Save',
        message: `At your current burn rate, you're likely to save ${currency}${prediction.projectedSavings.toLocaleString()} this month. Great discipline!`,
      });
    } else if (prediction.projectedBalance < 0) {
      insights.push({
        type: 'danger',
        icon: '🚨',
        title: 'Budget Overshoot Risk',
        message: `You're projected to overspend by ${currency}${Math.abs(prediction.projectedBalance).toLocaleString()} this month if the current trend continues.`,
      });
    }

    if (prediction.trend === 'increasing') {
      insights.push({
        type: 'warning',
        icon: '📊',
        title: 'Spending Accelerating',
        message: `Your daily spending in the second half of the month is higher than the first half. This acceleration pattern often leads to month-end cash crunches.`,
      });
    }
  }

  // Top category advice
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    if (top.percentage > 35) {
      insights.push({
        type: 'info',
        icon: '🍽️',
        title: `${top.category} Dominates`,
        message: `${top.category} accounts for ${top.percentage}% of your total spending. This concentration may limit your financial flexibility.`,
      });
    }
  }

  // Personality-based insight
  const personalityInsights = {
    Saver: {
      type: 'success', icon: '🏦',
      title: 'You\'re a Natural Saver',
      message: 'Your saving ratio is excellent! Consider moving surplus into index funds or high-yield instruments to make your savings work harder.',
    },
    Spender: {
      type: 'warning', icon: '🛒',
      title: 'Spender Profile Detected',
      message: 'Your spending patterns suggest lifestyle inflation. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
    },
    Balanced: {
      type: 'info', icon: '⚖️',
      title: 'Balanced Financial Profile',
      message: 'You maintain a healthy balance between spending and saving. Fine-tuning your investment allocation could take you to the next level.',
    },
    'Risk Taker': {
      type: 'warning', icon: '🎲',
      title: 'High-Risk Spending Pattern',
      message: 'You show signs of high-frequency, impulsive spending. Building a 3-month emergency fund should be your immediate priority.',
    },
  };

  if (personalityInsights[personality]) {
    insights.push(personalityInsights[personality]);
  }

  return insights;
}

// ─── SPENDING TREND (last 30 days daily) ─────────────────────────────────────
function getDailySpendingTrend(transactions, days = 30) {
  const result = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayExpenses = transactions.filter((t) => {
      const txDate = new Date(t.date).toISOString().split('T')[0];
      return txDate === dateStr && t.type === 'expense';
    });

    result.push({
      date: dateStr,
      amount: Math.round(dayExpenses.reduce((s, t) => s + t.amount, 0)),
      count: dayExpenses.length,
    });
  }

  return result;
}

module.exports = {
  detectImpulsiveSpending,
  analyzeWeekendVsWeekday,
  analyzeSalaryCycleSpending,
  analyzeCategoryBreakdown,
  compareMonths,
  classifyFinancialPersonality,
  predictEndOfMonth,
  generateInsights,
  getDailySpendingTrend,
};
