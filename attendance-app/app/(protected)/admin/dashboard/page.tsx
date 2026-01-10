import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, QrCode, UserCheck, Clock } from 'lucide-react';

async function getStats() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalSessions },
    { count: activeSessions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('approved', false),
    supabase.from('attendance_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('attendance_sessions').select('*', { count: 'exact', head: true }).gt('expires_at', new Date().toISOString()),
  ]);

  return {
    totalUsers: totalUsers || 0,
    pendingUsers: pendingUsers || 0,
    totalSessions: totalSessions || 0,
    activeSessions: activeSessions || 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingUsers,
      icon: UserCheck,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: QrCode,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Sessions',
      value: stats.activeSessions,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of E-Cell Attendance System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <a 
              href="/admin/users" 
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h3 className="font-medium">Approve Pending Users</h3>
              <p className="text-sm text-gray-500">
                {stats.pendingUsers} users waiting for approval
              </p>
            </a>
            <a 
              href="/admin/sessions" 
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h3 className="font-medium">Create New Session</h3>
              <p className="text-sm text-gray-500">
                Generate QR code for attendance
              </p>
            </a>
            <a 
              href="/admin/faculty" 
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h3 className="font-medium">Manage Faculty</h3>
              <p className="text-sm text-gray-500">
                Add faculty and generate access tokens
              </p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved Users</span>
              <span className="font-medium">{stats.totalUsers - stats.pendingUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="font-medium">{stats.activeSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expired Sessions</span>
              <span className="font-medium">{stats.totalSessions - stats.activeSessions}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
