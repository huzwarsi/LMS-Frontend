'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Code2, X } from 'lucide-react';

export default function DeveloperPopup() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Trigger toast after 10 seconds
    const timer = setTimeout(() => {
      setShowToast(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-hide after 8 seconds of appearing
  useEffect(() => {
    if (showToast) {
      const autoHide = setTimeout(() => {
        setShowToast(false);
      }, 8000);
      return () => clearTimeout(autoHide);
    }
  }, [showToast]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="flex items-center space-x-3.5 px-5 py-4 rounded-2xl bg-slate-900/95 text-white border border-indigo-500/40 shadow-2xl shadow-indigo-500/30 backdrop-blur-xl max-w-md">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-purple-500 shadow-md flex-shrink-0">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div className="pr-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Developer Credits
          </div>
          <div className="text-sm font-black text-slate-100 mt-0.5">
            This is developed by <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-violet-400 bg-clip-text text-transparent">Huzaifa Ali Warsi</span>
          </div>
        </div>
        <button
          onClick={() => setShowToast(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
