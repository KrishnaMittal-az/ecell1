import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

async function validateToken(token: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('faculty_view_tokens')
    .select(`
      id,
      expires_at,
      faculty (
        id,
        name,
        email
      )
    `)
    .eq('token', token)
    .single();

  if (error || !data) return null;

  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data;
}

async function getSessions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select(`
      id,
      title,
      description,
      created_at,
      expires_at,
      mom_pdf_url
    `)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export default async function FacultyPortalPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;
  const tokenData = await validateToken(token);

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid or Expired Token</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                This access token is invalid or has expired. Please contact the administrator for a new access link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessions = await getSessions();
  const faculty = tokenData.faculty as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Cell Faculty Portal</h1>
          <p className="text-sm text-gray-500">Welcome, {faculty.name}</p>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sessions
              </CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                With MOMs
              </CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sessions.filter(s => s.mom_pdf_url).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Access Expires
              </CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(tokenData.expires_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sessions available</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{session.title}</h3>
                        {session.description && (
                          <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                        )}
                      </div>
                      <Badge variant={session.mom_pdf_url ? 'default' : 'secondary'}>
                        {session.mom_pdf_url ? 'MOM Available' : 'No MOM'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Date: {new Date(session.created_at).toLocaleDateString()}
                      </span>
                      {session.mom_pdf_url && (
                        <Link
                          href={`/faculty/${token}/session/${session.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View Details & MOM →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
