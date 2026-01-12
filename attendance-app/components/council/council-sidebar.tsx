'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, QrCode, History, FileText, X, CheckSquare } from 'lucide-react';

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
  {
    title: 'My Tasks',
    href: '/council/tasks',
    icon: CheckSquare,
  },
];

interface CouncilSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CouncilSidebar({ isOpen, onClose }: CouncilSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        
        <nav className="p-4 space-y-2 mt-8 lg:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
    </>
  );
}
