'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, QrCode, History, FileText } from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/council/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Scan QR',
    href: '/council/scan',
    icon: QrCode,
  },
  {
    title: 'My Attendance',
    href: '/council/attendance',
    icon: History,
  },
  {
    title: 'MOMs',
    href: '/council/moms',
    icon: FileText,
  },
];

export function CouncilSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
