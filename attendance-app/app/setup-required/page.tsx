import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Database, Settings } from 'lucide-react';

export default function SetupRequiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl">Setup Required</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The E-Cell Attendance & MOM Management system needs to be configured before use.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Setup Steps:</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Create a Supabase Project</p>
                  <p className="text-sm text-gray-600">
                    Sign up at <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a> and create a new project
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Run Database Schema</p>
                  <p className="text-sm text-gray-600">
                    In Supabase SQL Editor, execute: <code className="bg-gray-100 px-1 rounded">supabase/schema.sql</code>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Configure Environment Variables</p>
                  <p className="text-sm text-gray-600">
                    Update <code className="bg-gray-100 px-1 rounded">.env.local</code> with your Supabase credentials
                  </p>
                  <div className="mt-2 bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
                    NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...<br />
                    SUPABASE_SERVICE_ROLE_KEY=eyJ...
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  4
                </div>
                <div>
                  <p className="font-medium">Restart the Server</p>
                  <p className="text-sm text-gray-600">
                    Stop and restart the dev server for changes to take effect
                  </p>
                  <div className="mt-2 bg-gray-100 p-2 rounded text-sm font-mono">
                    npm run dev
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">📚 Detailed Documentation</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a href="/SETUP.md" className="text-blue-600 hover:underline">→ Complete Setup Guide (SETUP.md)</a>
              <a href="/QUICK_ANSWER.md" className="text-blue-600 hover:underline">→ Quick Answer (QUICK_ANSWER.md)</a>
              <a href="/DATABASE_STORAGE_INFO.md" className="text-blue-600 hover:underline">→ Database & Storage Info</a>
              <a href="/SUPABASE_CHECKLIST.md" className="text-blue-600 hover:underline">→ Setup Checklist</a>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>After setup:</strong> The app will automatically redirect to the login page.
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-gray-500">
            <p>Need help? Check the documentation files in the project root.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
