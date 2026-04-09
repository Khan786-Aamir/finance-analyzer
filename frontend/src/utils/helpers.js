export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Math.abs(amount).toLocaleString('en-IN')}`;

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatShortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const getMonthYear = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const CATEGORY_COLORS = {
  'Food & Dining': '#F59E0B',
  'Shopping': '#8B5CF6',
  'Travel': '#3B82F6',
  'Entertainment': '#EC4899',
  'Bills & Utilities': '#6B7280',
  'Healthcare': '#10B981',
  'Education': '#06B6D4',
  'Groceries': '#F97316',
  'Fitness': '#84CC16',
  'Personal Care': '#A78BFA',
  'Investments': '#00F5D4',
  'Income': '#34D399',
  'Other': '#94A3B8',
};

export const CATEGORY_ICONS = {
  'Food & Dining': '🍽️',
  'Shopping': '🛍️',
  'Travel': '✈️',
  'Entertainment': '🎬',
  'Bills & Utilities': '⚡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Groceries': '🛒',
  'Fitness': '💪',
  'Personal Care': '💆',
  'Investments': '📈',
  'Income': '💰',
  'Other': '📦',
};

export const PERSONALITY_CONFIG = {
  Saver: {
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    icon: '🏦',
    description: 'Disciplined & Future-Focused',
    tip: 'You save consistently. Explore index funds to accelerate wealth.',
  },
  Spender: {
    color: '#F43F5E',
    gradient: 'from-rose-500 to-pink-500',
    icon: '🛒',
    description: 'Experience-Driven & Present-Focused',
    tip: 'Automate savings before spending to break the cycle.',
  },
  Balanced: {
    color: '#3B82F6',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '⚖️',
    description: 'Thoughtful & Pragmatic',
    tip: 'Great balance! Fine-tune your investment mix for long-term growth.',
  },
  'Risk Taker': {
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    icon: '🎲',
    description: 'Impulsive & Opportunity-Seeking',
    tip: 'Build a 3-month emergency fund before any high-risk moves.',
  },
  Unknown: {
    color: '#6B7280',
    gradient: 'from-gray-500 to-slate-500',
    icon: '❓',
    description: 'Add more transactions for analysis',
    tip: 'Add at least 10 transactions to unlock your financial personality.',
  },
};
