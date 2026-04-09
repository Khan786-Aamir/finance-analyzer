import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Save, Lightbulb, TrendingDown } from 'lucide-react';
import api from '../utils/api';
import { CATEGORY_ICONS } from '../utils/helpers';

const CATEGORIES = [
  'Food & Dining','Shopping','Travel','Entertainment',
  'Bills & Utilities','Healthcare','Education','Groceries','Fitness','Personal Care'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function BudgetPage() {
  const [budget, setBudget] = useState(null);
  const [monthly, setMonthly] = useState('');
  const [catBudgets, setCatBudgets] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/budget').then(r => {
      setBudget(r.data);
      setMonthly(r.data.monthlyBudget || '');
      setCatBudgets(r.data.categoryBudgets || {});
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/budget', {
        monthlyBudget: parseFloat(monthly) || 0,
        categoryBudgets: Object.fromEntries(
          Object.entries(catBudgets).map(([k, v]) => [k, parseFloat(v) || 0])
        ),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const totalCatBudget = Object.values(catBudgets).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const budgetNum = parseFloat(monthly) || 0;
  const overAllocated = budgetNum > 0 && totalCatBudget > budgetNum;

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-40 shimmer rounded-2xl" />)}
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 pb-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Budget Planner</h1>
          <p className="text-slate-500 text-sm">Set limits and track spending by category</p>
        </div>
        <motion.button
          onClick={handleSave} disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          <Save size={14} />
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Budget'}
        </motion.button>
      </motion.div>

      {/* Monthly Budget card */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-accent-cyan" />
          <h2 className="font-display font-semibold text-white">Monthly Budget</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1.5">Total monthly limit (₹)</label>
            <input
              type="number" value={monthly}
              onChange={e => setMonthly(e.target.value)}
              placeholder="e.g. 30000"
              className="fin-input max-w-xs"
            />
          </div>

          {/* Summary stats */}
          {budgetNum > 0 && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-slate-500 text-xs mb-1">Spent</p>
                <p className="font-mono font-bold text-rose-400">₹{(budget?.totalSpent || 0).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs mb-1">Remaining</p>
                <p className={`font-mono font-bold ${budgetNum - (budget?.totalSpent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{Math.abs(budgetNum - (budget?.totalSpent || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {budgetNum > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Budget utilization</span>
              <span className="font-mono">
                {Math.min(100, Math.round(((budget?.totalSpent || 0) / budgetNum) * 100))}%
              </span>
            </div>
            <div className="h-2.5 bg-surface-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((budget?.totalSpent || 0) / budgetNum) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  (budget?.totalSpent || 0) > budgetNum ? 'bg-rose-500' :
                  (budget?.totalSpent || 0) > budgetNum * 0.8 ? 'bg-amber-500' : 'bg-accent-cyan'
                }`}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Category allocation warning */}
      {overAllocated && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm"
        >
          <span className="text-lg">⚠️</span>
          <span>Category budgets total ₹{totalCatBudget.toLocaleString()} which exceeds your monthly budget of ₹{budgetNum.toLocaleString()}.</span>
        </motion.div>
      )}

      {/* AI suggestions banner */}
      {budget?.suggestions && Object.keys(budget.suggestions).length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl border border-accent-cyan/10">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-accent-cyan" />
            <p className="text-sm font-display font-medium text-accent-cyan">AI Budget Suggestions</p>
            <span className="text-xs text-slate-500">— based on your last 3 months average</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(budget.suggestions).slice(0, 6).map(([cat, val]) => (
              <button
                key={cat}
                onClick={() => setCatBudgets(p => ({ ...p, [cat]: val }))}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent-cyan/5 border border-accent-cyan/15
                  text-slate-300 hover:bg-accent-cyan/10 transition-all flex items-center gap-1.5"
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
                <span className="font-mono text-accent-cyan">₹{val.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category budgets grid */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-5">
          <TrendingDown size={16} className="text-violet-400" />
          <h2 className="font-display font-semibold text-white">Category Limits</h2>
          <span className="text-xs text-slate-500 ml-auto font-mono">
            Allocated: ₹{totalCatBudget.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat, i) => {
            const spent = budget?.spentByCategory?.[cat] || 0;
            const limit = parseFloat(catBudgets[cat]) || 0;
            const suggested = budget?.suggestions?.[cat];
            const pct = limit > 0 ? Math.min(110, (spent / limit) * 100) : 0;
            const over = limit > 0 && spent > limit;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-surface-600 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-sm text-white font-medium">{cat}</span>
                  </div>
                  <span className={`text-xs font-mono ${over ? 'text-rose-400' : 'text-slate-500'}`}>
                    ₹{spent.toLocaleString()} spent
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={catBudgets[cat] || ''}
                    onChange={e => setCatBudgets(p => ({ ...p, [cat]: e.target.value }))}
                    placeholder={suggested ? `AI: ₹${suggested.toLocaleString()}` : 'No limit set'}
                    className="fin-input py-2 text-xs pr-16"
                  />
                  {suggested && !catBudgets[cat] && (
                    <button
                      onClick={() => setCatBudgets(p => ({ ...p, [cat]: suggested }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono
                        px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20
                        hover:bg-accent-cyan/20 transition-all whitespace-nowrap"
                    >
                      Use AI
                    </button>
                  )}
                </div>

                {limit > 0 && (
                  <div className="mt-2.5">
                    <div className="h-1.5 bg-surface-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.04 }}
                        className={`h-full rounded-full ${
                          over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1">
                      <span>{Math.round(pct)}% used</span>
                      <span>₹{Math.max(0, limit - spent).toLocaleString()} left</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Save bottom CTA */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <motion.button
          onClick={handleSave} disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={15} />
          {saved ? '✓ All changes saved!' : saving ? 'Saving...' : 'Save All Changes'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
