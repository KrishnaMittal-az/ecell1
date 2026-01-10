import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

async function getAttendanceOverview() {
  const supabase = await createClient();
  
  const { data: sessions, error } = await supabase
    .from('attendance_sessions')
    .select(`
      id,
      title,
      created_at,
      expires_at,
      attendance_logs (
        id,
        users (
          name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return sessions || [];
}

export default async function AttendanceOverviewPage() {
  const sessions = await getAttendanceOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Overview</h1>
        <p className="text-gray-500 mt-1">View attendance for all sessions</p>
      </div>

      <div className="space-y-4">
        {sessions.map((session: any) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{session.title}</CardTitle>
                <Badge>
                  {session.attendance_logs?.length || 0} Attendees
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(session.created_at).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              {session.attendance_logs?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.attendance_logs.map((log: any, index: number) => (
                      <TableRow key={log.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {log.users?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{log.users?.email || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No attendance recorded
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
