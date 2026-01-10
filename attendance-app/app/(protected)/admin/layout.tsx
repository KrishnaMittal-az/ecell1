import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminNavbar } from '@/components/admin/admin-navbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
