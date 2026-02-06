import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atlas — AI Office Assistant',
  description: 'Your AI chief of staff for meetings, tasks, and decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <main className="ml-64 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
