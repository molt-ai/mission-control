'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/mission', icon: '🎯', label: 'Tasks' },
  { href: '/', icon: '📂', label: 'Projects' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-14 bg-gray-950 border-r border-gray-800/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-3 flex justify-center">
        <span className="text-xl">🚀</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
