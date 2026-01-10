'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { validateQRData } from '@/lib/qr';

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      let stream: MediaStream;
      
      // Try rear camera first, fallback to any camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Set scanning to true immediately
        scanningRef.current = true;
        setScanning(true);
        setResult(null);
        
        // Try to play video
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Video play error:', err);
        }
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setResult({
        success: false,
        message: 'Failed to access camera. Please grant camera permissions.',
      });
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    scanningRef.current = false;
    setScanning(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check scanningRef for synchronous state check
    if (!video || !canvas || !scanningRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCode(code.data);
        return;
      }
    }

    requestAnimationFrame(scanFrame);
  };

  const handleQRCode = async (data: string) => {
    stopScanning();
    setLoading(true);

    const validation = validateQRData(data);
    
    if (!validation.valid) {
      setResult({
        success: false,
        message: validation.error || 'Invalid QR code',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/council/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: validation.qrData!.token }),
      });

      const result = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Attendance marked successfully!',
        });
      } else {
        setResult({
          success: false,
          message: result.error || 'Failed to mark attendance',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to mark attendance. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Start scanning loop when scanning becomes true
  useEffect(() => {
    if (scanning) {
      scanFrame();
    }
  }, [scanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {/* Always render video element so ref is available */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
          playsInline
          autoPlay
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {scanning ? (
          <div className="absolute inset-0 border-4 border-blue-500 m-8 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="opacity-75">Camera not active</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex gap-2">
        {!scanning && !loading ? (
          <Button onClick={startScanning} className="flex-1">
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        ) : scanning ? (
          <Button onClick={stopScanning} variant="destructive" className="flex-1">
            Stop Scanning
          </Button>
        ) : (
          <Button disabled className="flex-1">
            Processing...
          </Button>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>• Position the QR code within the frame</p>
        <p>• Ensure good lighting for best results</p>
        <p>• The QR code will be scanned automatically</p>
      </div>
    </div>
  );
}
