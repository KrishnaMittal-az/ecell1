import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

async function getSessionsWithMOMs() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('id, title, description, created_at, mom_pdf_url')
    .not('mom_pdf_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default async function MOMsPage() {
  const sessions = await getSessionsWithMOMs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Minutes of Meetings</h1>
        <p className="text-gray-500 mt-1">Access all meeting minutes and documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available MOMs ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No MOMs available yet</p>
              <p className="text-sm text-gray-400 mt-1">
                MOMs will appear here once uploaded by admins
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session: any) => (
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
                    <Badge>
                      {new Date(session.created_at).toLocaleDateString()}
                    </Badge>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full"
                  >
                    <a
                      href={session.mom_pdf_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View MOM
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
