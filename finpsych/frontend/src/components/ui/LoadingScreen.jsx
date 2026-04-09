import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo animation */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-blue"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          />
          <div className="absolute inset-1.5 rounded-xl bg-surface-900 flex items-center justify-center">
            <span className="text-2xl font-display font-black gradient-text">Ψ</span>
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-accent-cyan"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <p className="text-slate-500 font-body text-sm tracking-widest uppercase">
          Loading FinPsych
        </p>
      </motion.div>
    </div>
  );
}
