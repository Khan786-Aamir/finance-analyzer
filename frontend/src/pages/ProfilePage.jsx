import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Shield, Cpu, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PERSONALITY_CONFIG } from '../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    monthlyIncome: user?.monthlyIncome || '',
    salaryDate: user?.salaryDate || 1,
    currency: user?.currency || '₹',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const conf = PERSONALITY_CONFIG[user?.financialPersonality || 'Unknown'];
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
        salaryDate: parseInt(form.salaryDate) || 1,
        currency: form.currency,
      });
      updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="max-w-2xl space-y-5 pb-8">

      <motion.div variants={itemVariants}>
        <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
        <p className="text-slate-500 text-sm">Manage your account and financial preferences</p>
      </motion.div>

      {/* Personality hero card */}
      <motion.div variants={itemVariants}
        className="glass-card p-5 rounded-2xl relative overflow-hidden"
        style={{ borderColor: conf.color + '25', borderWidth: 1 }}
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-15"
          style={{ background: conf.color }} />

        <div className="flex items-center gap-5 relative">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: conf.color + '20', border: `1px solid ${conf.color}30` }}>
            {conf.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-wider">Financial Personality</p>
            <p className={`font-display font-black text-2xl bg-gradient-to-r ${conf.gradient}
              bg-clip-text text-transparent leading-tight`}>
              {user?.financialPersonality || 'Unknown'}
            </p>
            <p className="text-slate-400 text-sm mt-1">{conf.description}</p>
          </div>

          {/* Initial avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-accent-cyan
            flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-slate-400">
          💡 {conf.tip}
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-5">
          <User size={15} className="text-accent-cyan" />
          <h2 className="font-display font-semibold text-white">Personal Information</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5">Full Name</label>
            <input value={form.name} onChange={set('name')} placeholder="Your name" className="fin-input" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5">Email Address</label>
            <input value={user?.email} disabled
              className="fin-input opacity-40 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Monthly Income</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                {form.currency}
              </span>
              <input
                type="number" value={form.monthlyIncome} onChange={set('monthlyIncome')}
                placeholder="50000" className="fin-input pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Salary Credit Date</label>
            <input
              type="number" value={form.salaryDate} onChange={set('salaryDate')}
              placeholder="1" min="1" max="31" className="fin-input"
            />
            <p className="text-xs text-slate-600 mt-1">Day of month you receive salary (1–31)</p>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Currency</label>
            <select value={form.currency} onChange={set('currency')} className="fin-input">
              <option value="₹">₹ Indian Rupee (INR)</option>
              <option value="$">$ US Dollar (USD)</option>
              <option value="€">€ Euro (EUR)</option>
              <option value="£">£ British Pound (GBP)</option>
              <option value="¥">¥ Japanese Yen (JPY)</option>
              <option value="S$">S$ Singapore Dollar (SGD)</option>
            </select>
          </div>
        </div>

        <motion.button
          onClick={handleSave} disabled={saving}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          className="btn-primary mt-5 flex items-center gap-2 px-6"
        >
          <Save size={14} />
          {saved ? '✓ Profile saved!' : saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>

      {/* Account details */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-violet-400" />
          <h2 className="font-display font-semibold text-white">Account Details</h2>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Account ID', value: user?._id?.slice(-8).toUpperCase(), mono: true },
            { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Monthly Budget', value: user?.monthlyBudget > 0 ? `₹${user.monthlyBudget.toLocaleString()}` : 'Not set' },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <span className="text-slate-500 text-sm">{label}</span>
              <span className={`text-slate-300 text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* About AI Engine */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={15} className="text-emerald-400" />
          <h2 className="font-display font-semibold text-white">AI Engine Status</h2>
          <span className="badge badge-success ml-auto">Active</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Behavior Analysis', active: true },
            { label: 'Impulsive Detection', active: true },
            { label: 'Salary-Cycle Watch', active: true },
            { label: 'Predictive Savings', active: true },
            { label: 'Personality Scoring', active: true },
            { label: 'Smart Insights', active: true },
          ].map(({ label, active }) => (
            <div key={label}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-600 border border-white/5 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
