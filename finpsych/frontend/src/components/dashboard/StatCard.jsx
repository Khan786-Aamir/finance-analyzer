import React from 'react';
import { motion } from 'framer-motion';

// ─── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color, sub, negative }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-400/10',
    rose: 'text-rose-400 bg-rose-400/10',
    cyan: 'text-accent-cyan bg-accent-cyan/10',
    violet: 'text-violet-400 bg-violet-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
  };
  const cls = colorMap[color] || colorMap.cyan;

  return (
    <div className="glass-card p-4 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at top right, rgba(0,245,212,0.03), transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 font-body">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
          {icon}
        </div>
      </div>
      <p className={`font-mono text-xl font-bold ${negative ? 'text-rose-400' : 'text-white'}`}>
        {negative && '−'}{value}
      </p>
      {sub && <p className="text-xs text-slate-600 mt-1 font-body">{sub}</p>}
    </div>
  );
}

export default StatCard;
