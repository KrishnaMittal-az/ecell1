import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function validateToken(token: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('faculty_view_tokens')
    .select('id, expires_at, faculty(name, email)')
    .eq('token', token)
    .single();

  if (error || !data || new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data;
}

async function getSessionDetails(sessionId: string) {
  const supabase = await createClient();
  
  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select(`
      id,
      title,
      description,
      created_at,
      expires_at,
      mom_pdf_url
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) return null;

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance_logs')
    .select(`
      id,
      marked_at,
      users (
        name,
        email
      )
    `)
    .eq('session_id', sessionId)
    .order('marked_at', { ascending: true });

  return {
    session,
    attendance: attendance || [],
  };
}

export default async function FacultySessionDetailPage({
  params,
}: {
  params: Promise<{ token: string; sessionId: string }>;
}) {
  const { token, sessionId } = await params;
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
                This access token is invalid or has expired.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = await getSessionDetails(sessionId);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                The requested session could not be found.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, attendance } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/faculty/${token}`}
            className="inline-flex items-center text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sessions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{session.title}</CardTitle>
                {session.description && (
                  <p className="text-gray-600 mt-2">{session.description}</p>
                )}
              </div>
              <Badge>
                {new Date(session.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">{new Date(session.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Expired:</span>
                <p className="font-medium">{new Date(session.expires_at).toLocaleString()}</p>
              </div>
            </div>

            {session.mom_pdf_url && (
              <div>
                <Button asChild className="w-full">
                  <a 
                    href={session.mom_pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Minutes of Meeting (PDF)
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance ({attendance.length} Members)</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No attendance recorded for this session
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Marked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record: any, index: number) => (
                    <TableRow key={record.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {record.users?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{record.users?.email || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(record.marked_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
