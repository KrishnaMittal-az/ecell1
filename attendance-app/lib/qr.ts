import { qrTokenSchema } from './validators';

export interface QRData {
  sessionId: string;
  token: string;
  expiresAt: string;
}

export function generateQRData(sessionId: string, token: string, expiresAt: string): string {
  const data: QRData = {
    sessionId,
    token,
    expiresAt,
  };
  return JSON.stringify(data);
}

export function parseQRData(data: string): QRData | null {
  try {
    const parsed = JSON.parse(data);
    const validated = qrTokenSchema.parse(parsed);
    return validated;
  } catch {
    return null;
  }
}

export function isQRTokenExpired(expiresAt: string): boolean {
  const expiry = new Date(expiresAt);
  const now = new Date();
  return now > expiry;
}

export function validateQRData(data: string): { valid: boolean; error?: string; qrData?: QRData } {
  const qrData = parseQRData(data);
  
  if (!qrData) {
    return { valid: false, error: 'Invalid QR code format' };
  }

  if (isQRTokenExpired(qrData.expiresAt)) {
    return { valid: false, error: 'QR code has expired' };
  }

  return { valid: true, qrData };
}
