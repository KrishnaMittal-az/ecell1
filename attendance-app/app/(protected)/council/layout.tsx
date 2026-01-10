import { redirect } from 'next/navigation';
import { requireApproved } from '@/lib/auth';
import { CouncilNavbar } from '@/components/council/council-navbar';
import { CouncilSidebar } from '@/components/council/council-sidebar';

export default async function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireApproved();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CouncilNavbar />
      <div className="flex">
        <CouncilSidebar />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
