import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, Brain, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // ✅ FIXED

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
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-12
          bg-gradient-to-br from-surface-800 via-surface-900 to-surface-800
          border-r border-white/5 relative overflow-hidden"
      >
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

          <p className="text-slate-400 font-body text-lg mb-12 max-w-md">
            Go beyond expense tracking. Discover the psychology behind your spending.
          </p>

          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon size={15} className="text-accent-cyan" />
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-2 border-accent-cyan/50">
          <p className="text-slate-300 italic text-sm">
            "A budget is telling your money where to go instead of wondering where it went."
          </p>
        </div>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your dashboard</p>
          </div>

          {error && (
            <div className="mb-5 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              className="fin-input"
            />

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Password"
                className="fin-input pr-10"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button className="btn-primary">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400 text-center">
            Don't have an account? <Link to="/signup">Signup</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}