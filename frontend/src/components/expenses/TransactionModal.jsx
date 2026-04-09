import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import api from '../../utils/api';
import { CATEGORY_ICONS } from '../../utils/helpers';

const CATEGORIES = [
  'Food & Dining','Shopping','Travel','Entertainment','Bills & Utilities',
  'Healthcare','Education','Groceries','Fitness','Personal Care','Investments','Income','Other'
];

const blank = {
  type: 'expense', amount: '', category: 'Food & Dining',
  description: '', date: new Date().toISOString().split('T')[0],
};

export default function TransactionModal({ open, tx, onClose, onSaved }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tx) {
      setForm({
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description || '',
        date: new Date(tx.date).toISOString().split('T')[0],
      });
    } else {
      setForm(blank);
    }
    setError('');
  }, [tx, open]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (tx) {
        await api.put(`/transactions/${tx._id}`, form);
      } else {
        await api.post('/transactions', form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              w-full max-w-md glass-card rounded-2xl p-6 border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-white">
                {tx ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div>
                <label className="block text-xs text-slate-500 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-surface-600 rounded-xl">
                  {['expense', 'income'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      className={`py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        form.type === t
                          ? t === 'expense'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}>
                      {t === 'expense' ? '↑ Expense' : '↓ Income'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Amount (₹)</label>
                <input
                  type="number" required min="0.01" step="0.01"
                  value={form.amount} onChange={set('amount')}
                  placeholder="0.00" className="fin-input text-lg font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Category</label>
                <select value={form.category} onChange={set('category')} className="fin-input">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Description (optional)</label>
                <input
                  value={form.description} onChange={set('description')}
                  placeholder="e.g. Lunch at office"
                  className="fin-input"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Date</label>
                <input
                  type="date" required value={form.date} onChange={set('date')}
                  className="fin-input"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
                <motion.button
                  type="submit" disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  ) : (
                    <><Check size={15} /> {tx ? 'Update' : 'Add Transaction'}</>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
