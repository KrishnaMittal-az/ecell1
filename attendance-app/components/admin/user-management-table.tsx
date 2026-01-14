'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type UserYear = '1st' | '2nd' | '3rd' | null;

interface ExtendedUser extends User {
  year?: UserYear;
}

export function UserManagementTable({ users: initialUsers }: { users: ExtendedUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async (userId: string) => {
    setLoading(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved: true }),
      });

      if (!response.ok) throw new Error('Failed to approve user');

      setUsers(users.map(user =>
        user.id === userId ? { ...user, approved: true } : user
      ));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to approve user');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setLoading(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved: false }),
      });

      if (!response.ok) throw new Error('Failed to reject user');

      setUsers(users.map(user =>
        user.id === userId ? { ...user, approved: false } : user
      ));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to reject user');
    } finally {
      setLoading(null);
    }
  };

  const handleYearChange = async (userId: string, year: UserYear) => {
    setLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ year })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, year } : user
      ));
    } catch (error) {
      console.error(error);
      alert('Failed to update year');
    } finally {
      setLoading(null);
    }
  };

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  const YearBadge = ({ year }: { year?: UserYear }) => {
    if (!year) return <span className="text-gray-400 text-sm">Not set</span>;
    const colors: Record<string, string> = {
      '1st': 'bg-green-100 text-green-800',
      '2nd': 'bg-blue-100 text-blue-800',
      '3rd': 'bg-purple-100 text-purple-800',
    };
    return <Badge className={colors[year]}>{year} Year</Badge>;
  };

  return (
    <div className="space-y-6">
      {pendingUsers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Pending Approvals ({pendingUsers.length})</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                          disabled={loading === user.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(user.id)}
                          disabled={loading === user.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Approved Users ({approvedUsers.length})</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <span className="text-gray-400 text-sm">N/A</span>
                    ) : (
                      <select
                        value={user.year || ''}
                        onChange={(e) => handleYearChange(user.id, e.target.value as UserYear || null)}
                        disabled={loading === user.id}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                      </select>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
