'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Public routes that don't require authentication
    const publicPaths = ['/login'];
    const isPublic = publicPaths.includes(pathname);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!isPublic && (!token || !user)) {
      setAuthorized(false);
      router.push('/login');
    } else if (isPublic && token && user) {
      router.push('/');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  // While checking auth on protected routes, prevent flashing content
  if (!authorized && pathname !== '/login') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
