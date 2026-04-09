import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, Brain, Target,
  User, LogOut, Menu, X, TrendingUp, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/insights', icon: Brain, label: 'AI Insights' },
  { to: '/budget', icon: Target, label: 'Budget' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue
          flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-cyan/20">
          <span className="text-lg font-display font-black text-surface-900">Ψ</span>
        </div>
        <div>
          <div className="font-display font-bold text-white text-lg leading-none">FinPsych</div>
          <div className="text-xs text-slate-500 font-mono">AI Finance Analyzer</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-accent-cyan
            flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen relative z-10">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 glass-card m-3 mr-0 rounded-2xl flex-col
        border border-white/5 sticky top-3 h-[calc(100vh-24px)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 glass-card z-50 lg:hidden border-r border-white/5"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between p-4 glass-card m-3 mb-0 rounded-2xl">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold gradient-text">FinPsych</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-accent-cyan
            flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-3 lg:p-5 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
