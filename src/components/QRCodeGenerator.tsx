// src/components/QRCodeGenerator.tsx
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, QrCode } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { QRCodeData } from '../types/qr';
import { useState } from 'react';

interface QRCodeGeneratorProps {
  delivery: Delivery;
  size?: number;
  showActions?: boolean;
}

export const QRCodeGenerator = ({ 
  delivery, 
  size = 128, 
  showActions = true 
}: QRCodeGeneratorProps) => {
  const [copied, setCopied] = useState(false);

  const qrData: QRCodeData = {
    type: 'delivery',
    trackingNumber: delivery.trackingNumber,
    deliveryId: delivery.id,
    timestamp: new Date().toISOString()
  };

  const qrString = JSON.stringify(qrData);

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${delivery.id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `delivery-${delivery.trackingNumber}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(qrString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR data:', err);
    }
  };

  return (
    <div className="bg-card rounded-lg border text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <QrCode size={18} className="font-semibold leading-none tracking-tight" />
        <h3 className="text-sm font-medium font-semibold leading-none tracking-tight">QR Code</h3>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="bg-white p-2 rounded border">
          <QRCodeSVG
            id={`qr-${delivery.id}`}
            value={qrString}
            size={size}
            level="M"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
        
        {showActions && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs border rounded-md text-gray-700 bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <Download size={12} />
              Download
            </button>
            <button
              onClick={handleCopyData}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs border rounded-md text-gray-700 bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <Copy size={12} />
              {copied ? 'Copied!' : 'Copy Data'}
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Scan to quickly access delivery details
        </p>
      </div>
    </div>
  );
};