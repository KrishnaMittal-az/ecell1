import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';

async function getAttendance(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_logs')
    .select(`
      id,
      marked_at,
      attendance_sessions (
        id,
        title,
        description,
        expires_at
      )
    `)
    .eq('user_id', userId)
    .order('marked_at', { ascending: false });

  if (error) throw error;
  return data;
}

export default async function AttendancePage() {
  const user = await requireApproved();
  const attendance = await getAttendance(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 mt-1">View your attendance history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>Attendance Records</span>
              <Badge className="bg-green-100 text-green-800">
                {attendance.length} Sessions Attended
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No attendance records yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Scan QR codes at sessions to mark your attendance
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Marked At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.attendance_sessions?.title || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.attendance_sessions?.description || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(record.marked_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Present
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
