import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, Brain, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const features = [
  { icon: Brain, text: 'AI-Powered Behavior Analysis' },
  { icon: TrendingUp, text: 'Predictive Balance Forecasting' },
  { icon: Shield, text: 'Secure JWT Authentication' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-12
          bg-gradient-to-br from-surface-800 via-surface-900 to-surface-800
          border-r border-white/5 relative overflow-hidden"
      >
        {/* Decorative rings */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-accent-cyan/5" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-accent-cyan/8" />
        <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border border-violet-500/10" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue
              flex items-center justify-center shadow-lg shadow-accent-cyan/30">
              <span className="text-xl font-display font-black text-surface-900">Ψ</span>
            </div>
            <span className="font-display font-bold text-xl text-white">FinPsych</span>
          </div>

          <h1 className="font-display font-black text-5xl text-white leading-tight mb-6">
            Understand your<br />
            <span className="gradient-text">financial mind</span>
          </h1>
          <p className="text-slate-400 font-body text-lg leading-relaxed mb-12 max-w-md">
            Go beyond expense tracking. Discover the psychology behind your spending
            and unlock AI-driven insights to transform your financial future.
          </p>

          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20
                  flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-accent-cyan" />
                </div>
                <span className="text-slate-300 font-body text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative glass-card p-5 rounded-2xl border-l-2 border-accent-cyan/50">
          <p className="text-slate-300 italic font-body text-sm leading-relaxed">
            "A budget is telling your money where to go instead of wondering where it went."
          </p>
          <p className="text-slate-500 text-xs mt-2 font-mono">— Dave Ramsey</p>
        </div>
      </motion.div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue
              flex items-center justify-center">
              <span className="text-base font-display font-black text-surface-900">Ψ</span>
            </div>
            <span className="font-display font-bold text-lg gradient-text">FinPsych</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 font-body">Sign in to your financial dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20
                text-rose-400 text-sm font-body flex items-center gap-2"
            >
              <span className="text-base">⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="fin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="fin-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-primary mt-2 py-3.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900
                    rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6 font-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-cyan hover:text-white transition-colors font-medium">
              Create one
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/10">
            <p className="text-xs text-slate-500 text-center font-mono">
              Demo: demo@finpsych.ai / demo123456
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
