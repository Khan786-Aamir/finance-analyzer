import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Upload, Trash2, Edit3, TrendingUp, TrendingDown, X, Zap } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import TransactionModal from '../components/expenses/TransactionModal';

const CATEGORIES = [
  'Food & Dining','Shopping','Travel','Entertainment','Bills & Utilities',
  'Healthcare','Education','Groceries','Fitness','Personal Care','Investments','Income','Other'
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, tx: null });
  const [filters, setFilters] = useState({ search: '', type: '', category: '', page: 1 });
  const [importing, setImporting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.category) params.set('category', filters.category);
      params.set('page', filters.page);
      params.set('limit', 30);
      params.set('sort', '-date');
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category, filters.page]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  const handleCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/transactions/import-csv', fd);
      alert(`✅ ${res.data.count} transactions imported!`);
      fetchTransactions();
    } catch (err) {
      alert('Import failed: ' + err.response?.data?.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Client-side search filter
  const filtered = transactions.filter(t =>
    !filters.search || t.description?.toLowerCase().includes(filters.search.toLowerCase())
    || t.category.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Transactions</h1>
          <p className="text-slate-500 text-sm">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <label className={`btn-ghost flex items-center gap-2 text-xs cursor-pointer ${importing ? 'opacity-50' : ''}`}>
            <Upload size={13} />
            {importing ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={handleCSV} className="hidden" disabled={importing} />
          </label>
          <button onClick={() => setModal({ open: true, tx: null })}
            className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-3 rounded-2xl flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            placeholder="Search transactions..."
            className="fin-input pl-9 py-2 text-xs"
          />
        </div>
        <select value={filters.type}
          onChange={e => setFilters(p => ({ ...p, type: e.target.value, page: 1 }))}
          className="fin-input py-2 text-xs w-auto min-w-28">
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select value={filters.category}
          onChange={e => setFilters(p => ({ ...p, category: e.target.value, page: 1 }))}
          className="fin-input py-2 text-xs w-auto min-w-36">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filters.type || filters.category || filters.search) && (
          <button onClick={() => setFilters({ search: '', type: '', category: '', page: 1 })}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 shimmer rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500">No transactions found</p>
            <button onClick={() => setModal({ open: true, tx: null })}
              className="mt-3 btn-ghost text-sm">
              + Add your first transaction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {/* Table header */}
            <div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 px-5 py-3 text-xs text-slate-600 font-mono uppercase tracking-wider">
              <span>Description</span>
              <span className="hidden sm:block">Date</span>
              <span>Amount</span>
              <span className="w-16 text-right">Actions</span>
            </div>

            <AnimatePresence>
              {filtered.map((tx, i) => (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-[1fr,auto,auto,auto] gap-4 px-5 py-4 items-center
                    hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Category + description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: `${CATEGORY_COLORS[tx.category]}18` }}>
                      {CATEGORY_ICONS[tx.category] || '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {tx.description || tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-600 truncate">{tx.category}</span>
                        {tx.isImpulsive && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono
                            bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                            <Zap size={8} /> impulsive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="hidden sm:block text-xs text-slate-600 font-mono whitespace-nowrap">
                    {formatDate(tx.date)}
                  </span>

                  {/* Amount */}
                  <span className={`font-mono font-semibold text-sm whitespace-nowrap ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '−'} ₹{tx.amount.toLocaleString()}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-16 justify-end">
                    <button
                      onClick={() => setModal({ open: true, tx })}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(tx._id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 30 && (
        <div className="flex justify-center gap-2">
          <button disabled={filters.page === 1}
            onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
            className="btn-ghost text-xs px-4 py-2 disabled:opacity-30">
            ← Prev
          </button>
          <span className="text-slate-500 text-xs py-2 px-3">
            Page {filters.page} of {Math.ceil(total / 30)}
          </span>
          <button disabled={filters.page >= Math.ceil(total / 30)}
            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
            className="btn-ghost text-xs px-4 py-2 disabled:opacity-30">
            Next →
          </button>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        open={modal.open}
        tx={modal.tx}
        onClose={() => setModal({ open: false, tx: null })}
        onSaved={fetchTransactions}
      />
    </div>
  );
}
