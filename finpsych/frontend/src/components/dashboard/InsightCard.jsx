import React from 'react';
import { motion } from 'framer-motion';

// ─── InsightCard ──────────────────────────────────────────────────────────────
export function InsightCard({ insight }) {
  const typeStyles = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    danger:  'border-rose-500/20 bg-rose-500/5',
    alert:   'border-orange-500/20 bg-orange-500/5',
    info:    'border-blue-500/20 bg-blue-500/5',
  };
  const titleStyles = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger:  'text-rose-400',
    alert:   'text-orange-400',
    info:    'text-blue-400',
  };

  return (
    <div className={`flex gap-3 p-3 rounded-xl border ${typeStyles[insight.type] || typeStyles.info}`}>
      <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
      <div>
        <p className={`text-xs font-display font-semibold mb-0.5 ${titleStyles[insight.type]}`}>
          {insight.title}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">{insight.message}</p>
      </div>
    </div>
  );
}

// ─── BudgetAlert ──────────────────────────────────────────────────────────────
export function BudgetAlert({ alert }) {
  const isExceeded = alert.type === 'exceeded';
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-4 rounded-2xl border ${
        isExceeded
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}
    >
      <span className="text-xl">{isExceeded ? '🚨' : '⚠️'}</span>
      <div className="flex-1">
        <p className="text-sm font-display font-semibold">{alert.message}</p>
        <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isExceeded ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, alert.percentage)}%` }}
          />
        </div>
      </div>
      <div className="text-xs font-mono opacity-70">{alert.percentage}%</div>
    </motion.div>
  );
}

export default InsightCard;
