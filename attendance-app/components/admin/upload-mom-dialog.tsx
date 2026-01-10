'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AttendanceSession } from '@/lib/types';
import { Upload } from 'lucide-react';

interface UploadMOMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AttendanceSession;
  onSuccess: (sessionId: string, momUrl: string) => void;
}

export function UploadMOMDialog({ 
  open, 
  onOpenChange, 
  session,
  onSuccess 
}: UploadMOMDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', session.id);

      const response = await fetch('/api/admin/sessions/upload-mom', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload MOM');

      const { momUrl } = await response.json();
      onSuccess(session.id, momUrl);
      onOpenChange(false);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload MOM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Minutes of Meeting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Session: {session.title}</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mom-file">Select PDF File (Max 10MB)</Label>
            <Input
              id="mom-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {file && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Selected:</span> {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
