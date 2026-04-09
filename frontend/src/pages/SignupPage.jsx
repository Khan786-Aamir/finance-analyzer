import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // ✅ FIXED PATH

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    monthlyIncome: '', salaryDate: '1',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
        salaryDate: parseInt(form.salaryDate) || 1,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Signup failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue
            flex items-center justify-center">
            <span className="text-base font-display font-black text-surface-900">Ψ</span>
          </div>
          <span className="font-display font-bold text-lg gradient-text">FinPsych</span>
        </div>

        <div className="mb-8">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Create your account
          </h2>
          <p className="text-slate-400 font-body text-sm">
            Start your AI-powered financial journey today
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20
              text-rose-400 text-sm flex items-center gap-2"
          >
            <span>⚠️</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Alex Kumar"
                className="fin-input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="fin-input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 6 characters"
                  className="fin-input pr-11"
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Monthly Income <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="number"
                value={form.monthlyIncome}
                onChange={set('monthlyIncome')}
                placeholder="₹50,000"
                className="fin-input"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Salary Date <span className="text-slate-600">(day)</span>
              </label>
              <input
                type="number"
                value={form.salaryDate}
                onChange={set('salaryDate')}
                placeholder="1"
                className="fin-input"
                min="1"
                max="31"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary mt-1 py-3.5 text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account →'
            )}
          </motion.button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent-cyan hover:text-white transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}