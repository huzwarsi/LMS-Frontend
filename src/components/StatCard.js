'use client';

import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-500/20',
      glow: 'shadow-indigo-500/5',
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      glow: 'shadow-emerald-500/5',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-500/20',
      glow: 'shadow-amber-500/5',
    },
    violet: {
      bg: 'bg-violet-500/10 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-200 dark:border-violet-500/20',
      glow: 'shadow-violet-500/5',
    },
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`glass-card p-6 rounded-2xl border ${currentTheme.border} shadow-lg ${currentTheme.glow}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`p-3.5 rounded-xl ${currentTheme.bg} ${currentTheme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
