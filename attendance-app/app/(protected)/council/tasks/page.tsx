import { redirect } from 'next/navigation';
import { requireApproved } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CouncilTasksPage() {
  try {
    const user = await requireApproved();
    
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your assigned tasks
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Task Management System</h2>
            <p className="text-muted-foreground mb-6">
              The task management system is being integrated with the attendance app.
            </p>
            <div className="space-y-4 max-w-2xl mx-auto text-left">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📋 What You Can Do:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>View tasks assigned to you</li>
                  <li>Submit completed tasks with proof files</li>
                  <li>Track your submission status</li>
                  <li>Receive notifications for task updates</li>
                  <li>Comment on tasks and collaborate</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Your Role:</strong> {user.role} {user.year ? `(${user.year} year)` : ''}
                </p>
                <p className="text-sm mt-2">
                  Task features will be available here once the integration is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/login');
  }
}
