'use client';

import React, { useState, useEffect } from 'react';
import { User, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

import Link from 'next/link';

export default function Header({ title, description }) {
  const [userName, setUserName] = useState('Administrator');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setUserName(parsed.name);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800/60 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{description}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 transition-all flex items-center gap-2 text-sm font-medium"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Notification Badge */}
        <button className="p-2.5 rounded-xl glass-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
        </button>

        {/* User Pill -> Link to Profile */}
        <Link href="/profile" className="flex items-center space-x-3 glass-card px-3.5 py-2 rounded-xl hover:ring-2 hover:ring-indigo-500/50 transition-all cursor-pointer">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{userName}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Admin Account</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
