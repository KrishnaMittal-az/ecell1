import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, CheckCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getStats(userId: string) {
  const supabase = await createClient();

  const [
    { count: totalSessions },
    { count: activeSessions },
    { count: myAttendance },
  ] = await Promise.all([
    supabase.from('attendance_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('attendance_sessions').select('*', { count: 'exact', head: true }).gt('expires_at', new Date().toISOString()),
    supabase.from('attendance_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    totalSessions: totalSessions || 0,
    activeSessions: activeSessions || 0,
    myAttendance: myAttendance || 0,
  };
}

async function getRecentSessions() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('attendance_sessions')
    .select('id, title, expires_at, mom_pdf_url')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function CouncilDashboardPage() {
  const user = await requireApproved();
  const stats = await getStats(user.id);
  const recentSessions = await getRecentSessions();

  const statCards = [
    {
      title: 'Active Sessions',
      value: stats.activeSessions,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'My Attendance',
      value: stats.myAttendance,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: QrCode,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
        <p className="text-gray-500 mt-1">Track your attendance and view meeting records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link 
              href="/council/scan" 
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Scan QR Code</h3>
                  <p className="text-sm text-blue-700">Mark your attendance</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/council/attendance" 
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-gray-600" />
                <div>
                  <h3 className="font-medium">View Attendance</h3>
                  <p className="text-sm text-gray-600">Check your attendance history</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active sessions</p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {new Date(session.expires_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
