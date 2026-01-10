import { createClient } from '@/lib/supabase/server';
import { UserManagementTable } from '@/components/admin/user-management-table';

export const dynamic = 'force-dynamic';

async function getUsers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Approve and manage council members</p>
      </div>

      <UserManagementTable users={users} />
    </div>
  );
}
