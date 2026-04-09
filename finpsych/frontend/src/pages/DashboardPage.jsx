import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  Zap, AlertTriangle, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, CATEGORY_COLORS, PERSONALITY_CONFIG } from '../utils/helpers';
import PersonalityCard from '../components/dashboard/PersonalityCard';
import InsightCard from '../components/dashboard/InsightCard';
import StatCard from '../components/dashboard/StatCard';
import BudgetAlert from '../components/dashboard/BudgetAlert';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs font-mono border border-white/10 rounded-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, trendRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/trends?months=6'),
      ]);
      setData(dashRes.data);
      setTrends(trendRes.data);
    } catch (err) {
      setError('Failed to load dashboard. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="glass-card h-32 shimmer rounded-2xl" />
      ))}
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-rose-400">{error}</p>
      <button onClick={fetchData} className="btn-ghost flex items-center gap-2">
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  const { summary, categoryBreakdown, dailyTrend, insights, personalityData,
          prediction, budgetAlert, weekendAnalysis, impulsiveCount } = data;

  const personalityConf = PERSONALITY_CONFIG[personalityData?.personality || 'Unknown'];

  const pieData = categoryBreakdown?.slice(0, 6).map(c => ({
    name: c.category, value: c.total, color: CATEGORY_COLORS[c.category] || '#6B7280'
  })) || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="space-y-5 pb-8">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
            <span className="gradient-text"> {user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm font-body mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchData}
          className="btn-ghost flex items-center gap-2 text-xs px-3 py-2">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Budget Alert */}
      {budgetAlert && (
        <motion.div variants={itemVariants}>
          <BudgetAlert alert={budgetAlert} />
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Monthly Income"
          value={formatCurrency(summary.totalIncome)}
          icon={<TrendingUp size={18} />}
          color="emerald"
          sub={`${summary.transactionCount} transactions`}
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(summary.totalExpense)}
          icon={<TrendingDown size={18} />}
          color="rose"
          sub={impulsiveCount > 0 ? `${impulsiveCount} impulsive` : 'This month'}
        />
        <StatCard
          label="Balance"
          value={formatCurrency(Math.abs(summary.balance))}
          icon={<Wallet size={18} />}
          color={summary.balance >= 0 ? 'cyan' : 'rose'}
          sub={summary.balance >= 0 ? 'Positive' : 'Deficit'}
          negative={summary.balance < 0}
        />
        <StatCard
          label="Projected Savings"
          value={formatCurrency(prediction?.projectedSavings || 0)}
          icon={<PiggyBank size={18} />}
          color="violet"
          sub={`${prediction?.daysRemaining || 0} days left`}
        />
      </motion.div>

      {/* Prediction bar */}
      {prediction && (
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-accent-cyan" />
              <span className="text-sm font-display font-medium text-white">Month Prediction</span>
            </div>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full
              ${prediction.trend === 'increasing' ? 'bg-rose-500/10 text-rose-400' :
                prediction.trend === 'decreasing' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-blue-500/10 text-blue-400'}`}>
              {prediction.trend} trend
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Burn Rate / Day</p>
              <p className="font-mono text-white">₹{prediction.dailyBurnRate.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Projected Total Spend</p>
              <p className="font-mono text-amber-400">₹{prediction.projectedTotalSpend.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Days Remaining</p>
              <p className="font-mono text-white">{prediction.daysRemaining}</p>
            </div>
          </div>
          {/* Progress bar */}
          {user?.monthlyBudget > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Budget used</span>
                <span>{Math.min(100, Math.round((summary.totalExpense / user.monthlyBudget) * 100))}%</span>
              </div>
              <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (summary.totalExpense / user.monthlyBudget) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    summary.totalExpense > user.monthlyBudget ? 'bg-rose-500' :
                    summary.totalExpense > user.monthlyBudget * 0.8 ? 'bg-amber-500' : 'bg-accent-cyan'
                  }`}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">30-Day Spending Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyTrend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5D4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00F5D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => new Date(d).getDate()}
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false} tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="amount" stroke="#00F5D4"
                strokeWidth={2} fill="url(#spendGrad)"
                dot={false} activeDot={{ r: 4, fill: '#00F5D4' }}
                name="Spent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
          <h2 className="font-display font-semibold text-white mb-4">Category Split</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={40} outerRadius={65}
                    paddingAngle={3} dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-400 truncate max-w-[100px]">{d.name}</span>
                    </div>
                    <span className="font-mono text-slate-300">₹{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
              No expense data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* 6-month bar chart */}
      {trends.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
          <h2 className="font-display font-semibold text-white mb-4">6-Month Overview</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trends} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#10B981" radius={[4,4,0,0]} maxBarSize={28} name="Income" />
              <Bar dataKey="expense" fill="#F43F5E" radius={[4,4,0,0]} maxBarSize={28} name="Expense" />
              <Bar dataKey="savings" fill="#3B82F6" radius={[4,4,0,0]} maxBarSize={28} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bottom row: Personality + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Personality card */}
        <motion.div variants={itemVariants}>
          <PersonalityCard
            personality={personalityData?.personality}
            metrics={personalityData?.metrics}
            config={personalityConf}
          />
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card p-5 rounded-2xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-amber-400" />
              <h2 className="font-display font-semibold text-white">Smart Insights</h2>
              <span className="badge badge-warning ml-auto">{insights?.length || 0} alerts</span>
            </div>
            {insights?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {insights.map((ins, i) => (
                  <InsightCard key={i} insight={ins} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-slate-600 text-sm">
                Add more transactions to unlock AI insights
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
