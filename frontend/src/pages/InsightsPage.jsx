import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Calendar, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import api from '../utils/api';
import { InsightCard } from '../components/dashboard/InsightCard';
import PersonalityCard from '../components/dashboard/PersonalityCard';
import { PERSONALITY_CONFIG } from '../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-2 text-xs font-mono border border-white/10 rounded-lg">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: ₹{p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch(e) {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_,i) => <div key={i} className="glass-card h-48 shimmer rounded-2xl"/>)}
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 text-slate-500">
      Failed to load insights. Make sure the server is running.
    </div>
  );

  const { weekendAnalysis, salaryCycle, personalityData, insights,
          categoryBreakdown, prediction, dailyTrend } = data;

  const conf = PERSONALITY_CONFIG[personalityData?.personality || 'Unknown'];

  // Radar chart data from personality metrics
  const radarData = personalityData?.metrics ? [
    { subject: 'Saving', value: Math.round(personalityData.metrics.savingRatio * 100) },
    { subject: 'Discipline', value: Math.round((1 - personalityData.metrics.impulsiveRatio) * 100) },
    { subject: 'Necessity', value: Math.round((1 - personalityData.metrics.luxuryRatio) * 100) },
    { subject: 'Frequency', value: Math.min(100, Math.round(personalityData.metrics.txnPerMonth * 2)) },
    { subject: 'Budgeting', value: prediction?.projectedSavings > 0 ? 75 : 30 },
  ] : [];

  // Weekend vs weekday chart data
  const weekComparison = [
    { name: 'Weekday', total: weekendAnalysis.weekdayTotal, avg: weekendAnalysis.weekdayAvg, fill: '#3B82F6' },
    { name: 'Weekend', total: weekendAnalysis.weekendTotal, avg: weekendAnalysis.weekendAvg, fill: weekendAnalysis.overspendOnWeekend ? '#F43F5E' : '#10B981' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 pb-8">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-accent-cyan
            flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">AI Insights</h1>
        </div>
        <p className="text-slate-500 text-sm">Behavioral analysis powered by FinPsych AI engine</p>
      </motion.div>

      {/* Top row: Personality + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <PersonalityCard
            personality={personalityData?.personality}
            metrics={personalityData?.metrics}
            config={conf}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
          <h2 className="font-display font-semibold text-white mb-4">Financial Health Radar</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Sans' }}
                />
                <Radar
                  name="Score" dataKey="value"
                  stroke={conf?.color || '#00F5D4'}
                  fill={conf?.color || '#00F5D4'}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Add transactions to generate radar
            </div>
          )}
        </motion.div>
      </div>

      {/* All insights */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} className="text-accent-cyan" />
          <h2 className="font-display font-semibold text-white">All Behavioral Insights</h2>
          <span className="badge badge-info ml-auto">{insights?.length || 0} insights</span>
        </div>
        {insights?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <InsightCard insight={ins} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-600">
            <Brain size={32} className="mx-auto mb-3 opacity-30" />
            <p>Add more transactions to unlock behavioral insights</p>
          </div>
        )}
      </motion.div>

      {/* Weekend vs Weekday */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-violet-400" />
            <h2 className="font-display font-semibold text-white">Weekend vs Weekday</h2>
            {weekendAnalysis.overspendOnWeekend && (
              <span className="badge badge-warning ml-auto">Overspend</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {weekComparison.map(w => (
              <div key={w.name} className="p-3 rounded-xl bg-surface-600 border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{w.name}</p>
                <p className="font-mono font-bold text-white text-lg">₹{w.total.toLocaleString()}</p>
                <p className="text-xs text-slate-600 mt-1">Avg ₹{w.avg.toLocaleString()}/txn</p>
              </div>
            ))}
          </div>
          {weekendAnalysis.overspendOnWeekend ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              🔍 You spend <strong>{Math.round((weekendAnalysis.ratio - 1) * 100)}% more per transaction</strong> on weekends.
              Consider setting a weekend cash envelope.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              ✅ Your weekend spending is well-controlled. Great discipline!
            </div>
          )}
        </motion.div>

        {/* Salary cycle */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-amber-400" />
            <h2 className="font-display font-semibold text-white">Salary Cycle Analysis</h2>
            {salaryCycle.hasSpikeAfterSalary && (
              <span className="badge badge-danger ml-auto">Spike!</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-surface-600 border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Post-Salary Spend</p>
              <p className="font-mono font-bold text-white text-lg">₹{salaryCycle.postSalaryTotal?.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-1">First 5 days</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-600 border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Rest of Month</p>
              <p className="font-mono font-bold text-white text-lg">₹{salaryCycle.otherTotal?.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-1">Remaining days</p>
            </div>
          </div>
          {salaryCycle.hasSpikeAfterSalary ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              ⚡ Post-salary spending is <strong>{Math.round((salaryCycle.spikeRatio - 1) * 100)}% higher</strong>.
              Consider auto-investing the moment salary hits.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              ✅ No significant salary-cycle spike. Steady spending habits detected.
            </div>
          )}
        </motion.div>
      </div>

      {/* Spending trend */}
      {dailyTrend?.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl">
          <h2 className="font-display font-semibold text-white mb-4">Daily Spending Pattern (30 days)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate()}
                tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#8B5CF6"
                strokeWidth={2} fill="url(#grad2)" dot={false} name="Spent" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
