'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AttendanceSession } from '@/lib/types';
import { generateQRData } from '@/lib/qr';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AttendanceSession;
}

export function QRCodeDialog({ open, onOpenChange, session }: QRCodeDialogProps) {
  const qrData = generateQRData(session.id, session.qr_token, session.expires_at);

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${session.title.replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{session.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrData}
              size={256}
              level="H"
              includeMargin
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            <p>Expires: {new Date(session.expires_at).toLocaleString()}</p>
            <p className="mt-1 text-xs">Scan this QR code to mark attendance</p>
          </div>
          <Button onClick={downloadQR} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
