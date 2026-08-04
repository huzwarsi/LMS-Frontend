'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Key,
  Save,
  LogOut,
  Activity,
  Server,
  ShieldCheck,
  Database,
  Clock,
  Fingerprint,
  Settings,
  Lock,
} from 'lucide-react';
import Notification from '@/components/Notification';

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          // fallback
        }
      }
      if (!stored) {
        setUser({ id: '1', name: 'System Admin', email: 'admin@lms.com', role: 'ADMIN' });
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }
    if (passwordForm.newPass.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }
    showToast('Password updated successfully (demo mode)');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    setShowPasswordSection(false);
  };

  if (!user) return null;

  const sessionInfo = [
    { label: 'Session Token', value: 'JWT Bearer Active', icon: Key, color: 'text-emerald-500' },
    { label: 'Last Login', value: new Date().toLocaleString(), icon: Clock, color: 'text-indigo-500' },
    { label: 'Login Method', value: 'Email + Password (JWT)', icon: Fingerprint, color: 'text-violet-500' },
    { label: 'Token Expiry', value: '7 Days Rolling', icon: Shield, color: 'text-amber-500' },
  ];

  const infraStatus = [
    { label: 'API Server', value: 'Express.js — Running', status: 'LIVE', icon: Server },
    { label: 'Database', value: 'PostgreSQL + Prisma ORM', status: 'CONNECTED', icon: Database },
    { label: 'Auth Guard', value: 'JWT Middleware Active', status: 'ACTIVE', icon: ShieldCheck },
    { label: 'Validation', value: 'Zod Schema Validation', status: 'ENABLED', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <Header title="Admin Profile & Settings" description="Account management, session details, and system infrastructure." />

      {toast && <Notification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Profile Card */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        </div>
        <div className="px-6 md:px-8 pb-6 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-500/30 border-4 border-white dark:border-slate-900">
                {user.name ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2) : 'SA'}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name || 'System Admin'}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user.role || 'ADMIN'}</span>
                  <span className="text-slate-400">•</span>
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info + Session Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-indigo-500" /> Account Information
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name || 'System Admin'}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Role</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                {user.role || 'ADMIN'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Account Created</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Session & Security Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-emerald-500" /> Session & Security
          </h3>

          <div className="space-y-3">
            {sessionInfo.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-500" /> Change Password
          </h3>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showPasswordSection ? 'Cancel' : 'Update Password'}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </form>
        )}

        {!showPasswordSection && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Click "Update Password" above to change your admin account password.</p>
        )}
      </div>

      {/* Infrastructure Status Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-5">
          <Server className="w-4 h-4 text-indigo-500" /> Platform Infrastructure Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {infraStatus.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {item.status}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
