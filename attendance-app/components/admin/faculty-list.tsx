'use client';

import { useState } from 'react';
import { Faculty, FacultyViewToken } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Link as LinkIcon, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FacultyListProps {
  faculty: Faculty[];
  tokens: any[];
}

export function FacultyList({ faculty, tokens: initialTokens }: FacultyListProps) {
  const [tokens, setTokens] = useState(initialTokens);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const router = useRouter();

  const generateToken = async () => {
    if (!selectedFaculty) {
      setError('Please select a faculty member');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/faculty/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty,
          expiresInDays,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate token');

      router.refresh();
      setSelectedFaculty('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const copyTokenLink = async (token: string) => {
    const url = `${window.location.origin}/faculty/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Access Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="faculty-select">Select Faculty</Label>
            <select
              id="faculty-select"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">Choose faculty...</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expires In (Days)</Label>
            <Input
              id="expires"
              type="number"
              min="1"
              max="365"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              disabled={loading}
            />
          </div>

          <Button onClick={generateToken} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Token'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Tokens ({tokens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tokens generated yet</p>
          ) : (
            <div className="space-y-4">
              {tokens.map((tokenData: any) => (
                <div
                  key={tokenData.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{tokenData.faculty?.name}</h4>
                      <p className="text-sm text-gray-600">{tokenData.faculty?.email}</p>
                    </div>
                    <Badge variant={isTokenExpired(tokenData.expires_at) ? 'secondary' : 'default'}>
                      {isTokenExpired(tokenData.expires_at) ? 'Expired' : 'Active'}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Expires: {new Date(tokenData.expires_at).toLocaleString()}</p>
                    <p className="text-xs mt-1">Created: {new Date(tokenData.created_at).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTokenLink(tokenData.token)}
                      className="flex-1"
                    >
                      {copiedToken === tokenData.token ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/faculty/${tokenData.token}`, '_blank')}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Faculty ({faculty.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No faculty members added yet</p>
          ) : (
            <div className="space-y-3">
              {faculty.map((f) => (
                <div key={f.id} className="border rounded-lg p-3">
                  <h4 className="font-semibold">{f.name}</h4>
                  <p className="text-sm text-gray-600">{f.email}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
