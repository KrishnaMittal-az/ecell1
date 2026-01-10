import { createClient } from '@/lib/supabase/server';
import { CreateSessionForm } from '@/components/admin/create-session-form';
import { SessionsList } from '@/components/admin/sessions-list';

async function getSessions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sessions Management</h1>
        <p className="text-gray-500 mt-1">Create and manage attendance sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CreateSessionForm />
        </div>
        <div className="lg:col-span-2">
          <SessionsList sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
