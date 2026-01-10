'use client';

import { useState } from 'react';
import { AttendanceSessionWithCreator } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Upload, Eye } from 'lucide-react';
import { QRCodeDialog } from '@/components/admin/qr-code-dialog';
import { UploadMOMDialog } from '@/components/admin/upload-mom-dialog';

export function SessionsList({ sessions: initialSessions }: { sessions: any[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedSession, setSelectedSession] = useState<AttendanceSessionWithCreator | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const handleShowQR = (session: AttendanceSessionWithCreator) => {
    setSelectedSession(session);
    setShowQR(true);
  };

  const handleShowUpload = (session: AttendanceSessionWithCreator) => {
    setSelectedSession(session);
    setShowUpload(true);
  };

  const handleUploadSuccess = (sessionId: string, momUrl: string) => {
    setSessions(sessions.map(s => 
      s.id === sessionId ? { ...s, mom_pdf_url: momUrl } : s
    ));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sessions created yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
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
                    <Badge variant={isExpired(session.expires_at) ? 'secondary' : 'default'}>
                      {isExpired(session.expires_at) ? 'Expired' : 'Active'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Expires: {new Date(session.expires_at).toLocaleString()}
                    </span>
                    {session.users && (
                      <span>
                        By: {session.users.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowQR(session)}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      View QR
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowUpload(session)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {session.mom_pdf_url ? 'Update MOM' : 'Upload MOM'}
                    </Button>
                    {session.mom_pdf_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(session.mom_pdf_url!, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View MOM
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSession && (
        <>
          <QRCodeDialog
            open={showQR}
            onOpenChange={setShowQR}
            session={selectedSession}
          />
          <UploadMOMDialog
            open={showUpload}
            onOpenChange={setShowUpload}
            session={selectedSession}
            onSuccess={handleUploadSuccess}
          />
        </>
      )}
    </>
  );
}
