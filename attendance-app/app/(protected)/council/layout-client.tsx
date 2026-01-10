'use client';

import { useState } from 'react';
import { CouncilNavbar } from '@/components/council/council-navbar';
import { CouncilSidebar } from '@/components/council/council-sidebar';

export function CouncilLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CouncilNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <CouncilSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <main className="flex-1 p-4 lg:p-6 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
