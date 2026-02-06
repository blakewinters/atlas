'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Chat', href: '/chat' },
    { label: 'Meetings', href: '/meetings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Atlas</h1>
        <p className="text-xs text-slate-500 mt-1">AI Office Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="my-6 border-t border-slate-800" />

        <Link
          href="/meetings/new"
          className="block w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-center hover:bg-blue-700 transition-colors"
        >
          + New Meeting
        </Link>
      </nav>

      {/* User Section */}
      <div className="px-6 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            B
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Blake</p>
            <p className="text-xs text-slate-500">BiggerPockets</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
