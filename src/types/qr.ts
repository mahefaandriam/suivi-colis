// src/types/qr.ts
export interface QRCodeData {
  type: 'delivery';
  trackingNumber: string;
  deliveryId: string;
  timestamp: string;
}

export interface ScanResult {
  success: boolean;
  data?: QRCodeData;
  error?: string;
}