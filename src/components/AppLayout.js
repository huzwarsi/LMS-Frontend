'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import DeveloperPopup from '@/components/DeveloperPopup';
import { ThemeProvider } from '@/context/ThemeContext';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <ThemeProvider>
      <AuthGuard>
        {isLoginPage ? (
          <main className="w-full min-h-screen">{children}</main>
        ) : (
          <div className="min-h-screen flex w-full">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">{children}</main>
          </div>
        )}
        {!isLoginPage && <DeveloperPopup />}
      </AuthGuard>
    </ThemeProvider>
  );
}
