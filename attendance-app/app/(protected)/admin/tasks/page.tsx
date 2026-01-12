import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  try {
    const user = await requireAdmin();
    
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and oversee all tasks in the system
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
                <h3 className="font-semibold mb-2">📋 Features Coming Soon:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Create and assign tasks to team members</li>
                  <li>Track task submissions with proof uploads</li>
                  <li>Review and approve submissions</li>
                  <li>Real-time notifications</li>
                  <li>Analytics and reporting dashboard</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Note:</strong> Task management functionality will be available here
                  once the integration is complete. The database schema has been prepared
                  in <code className="bg-background px-1 py-0.5 rounded">supabase/task-management-schema.sql</code>
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
