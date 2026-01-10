import { createClient } from '@/lib/supabase/server';
import { CreateFacultyForm } from '@/components/admin/create-faculty-form';
import { FacultyList } from '@/components/admin/faculty-list';

async function getFaculty() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('faculty')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getTokens() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('faculty_view_tokens')
    .select(`
      id,
      token,
      expires_at,
      created_at,
      faculty (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export default async function FacultyManagementPage() {
  const faculty = await getFaculty();
  const tokens = await getTokens();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
        <p className="text-gray-500 mt-1">Manage faculty and generate access tokens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CreateFacultyForm />
        </div>
        <div className="lg:col-span-2">
          <FacultyList faculty={faculty} tokens={tokens} />
        </div>
      </div>
    </div>
  );
}
