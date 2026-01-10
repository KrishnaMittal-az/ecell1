'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  checks?: Record<string, boolean>;
  instructions?: string;
  error?: string;
}

export function StorageHealthCheck() {
  const [storageHealth, setStorageHealth] = useState<HealthCheck>({ 
    status: 'checking', 
    message: 'Checking storage...' 
  });
  const [databaseHealth, setDatabaseHealth] = useState<HealthCheck>({ 
    status: 'checking', 
    message: 'Checking database...' 
  });
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    
    try {
      const [storageRes, databaseRes] = await Promise.all([
        fetch('/api/health/storage'),
        fetch('/api/health/database'),
      ]);

      const storageData = await storageRes.json();
      const databaseData = await databaseRes.json();

      setStorageHealth(storageData);
      setDatabaseHealth(databaseData);
    } catch (error) {
      setStorageHealth({
        status: 'error',
        message: 'Failed to check health',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setDatabaseHealth({
        status: 'error',
        message: 'Failed to check health',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      checking: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={variants[status] || variants.checking}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health Check</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={checkHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Health */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(databaseHealth.status)}
              <h3 className="font-semibold">Database</h3>
            </div>
            {getStatusBadge(databaseHealth.status)}
          </div>
          
          <p className="text-sm text-gray-600">{databaseHealth.message}</p>

          {databaseHealth.checks && (
            <div className="space-y-1">
              {Object.entries(databaseHealth.checks).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {value ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-gray-700">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}

          {databaseHealth.instructions && (
            <Alert>
              <AlertDescription className="text-sm">
                {databaseHealth.instructions}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Storage Health */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(storageHealth.status)}
              <h3 className="font-semibold">Storage (PDFs)</h3>
            </div>
            {getStatusBadge(storageHealth.status)}
          </div>
          
          <p className="text-sm text-gray-600">{storageHealth.message}</p>

          {storageHealth.checks && (
            <div className="space-y-1">
              {Object.entries(storageHealth.checks).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {value ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          )}

          {storageHealth.instructions && (
            <Alert>
              <AlertDescription className="text-sm">
                {storageHealth.instructions}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Setup Guide */}
        {(storageHealth.status !== 'healthy' || databaseHealth.status !== 'healthy') && (
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">Setup Required</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create a Supabase project at supabase.com</li>
                <li>Run the schema.sql file in SQL Editor</li>
                <li>Configure environment variables in .env.local</li>
                <li>Restart the development server</li>
              </ol>
              <p className="mt-2 text-sm">
                See <code className="bg-gray-100 px-1 rounded">SETUP.md</code> for detailed instructions.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
