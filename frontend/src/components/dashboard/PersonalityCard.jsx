import React from 'react';
import { motion } from 'framer-motion';
import { PERSONALITY_CONFIG } from '../../utils/helpers';

export default function PersonalityCard({ personality = 'Unknown', metrics, config }) {
  const conf = config || PERSONALITY_CONFIG[personality] || PERSONALITY_CONFIG.Unknown;

  return (
    <div className="glass-card p-5 rounded-2xl h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: conf.color }} />

      <p className="text-xs text-slate-500 font-body mb-3">Financial Personality</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{conf.icon}</div>
        <div>
          <p className={`font-display font-bold text-lg bg-gradient-to-r ${conf.gradient}
            bg-clip-text text-transparent`}>
            {personality}
          </p>
          <p className="text-xs text-slate-500">{conf.description}</p>
        </div>
      </div>

      {metrics && (
        <div className="space-y-2 mb-4">
          {[
            { label: 'Saving Ratio', value: metrics.savingRatio, pct: Math.round(metrics.savingRatio * 100) },
            { label: 'Luxury Spend', value: metrics.luxuryRatio, pct: Math.round(metrics.luxuryRatio * 100) },
            { label: 'Impulsive Rate', value: metrics.impulsiveRatio, pct: Math.round(metrics.impulsiveRatio * 100) },
          ].map(({ label, value, pct }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{label}</span>
                <span className="font-mono text-slate-400">{pct}%</span>
              </div>
              <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: conf.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-slate-400 leading-relaxed">
        💡 {conf.tip}
      </div>
    </div>
  );
}
