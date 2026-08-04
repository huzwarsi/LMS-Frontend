import './globals.css';
import AppLayout from '@/components/AppLayout';

export const metadata = {
  title: 'Student Management System',
  description: 'Enterprise Student Management System built with Next.js 15, Node.js, Express, Zod, and Prisma ORM.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans min-h-screen antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
