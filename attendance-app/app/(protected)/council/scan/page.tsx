'use client';

import { QRScanner } from '@/components/council/qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-gray-500 mt-1">Scan the session QR code to mark your attendance</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
