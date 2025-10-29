// src/components/QuickScanButton.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeScanner } from './QRCodeScanner';
import { Scan, QrCode } from 'lucide-react';
import { ScanResult } from '../types/qr';

export const QuickScanButton = () => {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScan = (result: ScanResult) => {

    if (result.success && result.data) {
      const currentPath = location.pathname.replace(/\/+$/, ''); // normalize trailing slash
      
      if (currentPath.includes('/admin')) {
        navigate(`/admin/deliveries/${result.data.deliveryId}`);
      } else {
        navigate(`/tracking/${result.data.deliveryId}`);
      }
      handleClose();
    } else {
      alert(result.error || 'Failed to scan QR code');
    }
  };

  const handleClose = () => {
    setShowScanner(false);
  };

  return (
    <>
      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground hover:bg-primary-700 rounded-full shadow-lg border flex items-center justify-center transition-all hover:scale-105"
        title="Quick Scan QR Code"
      >
        <Scan size={24} />
      </button>

      {showScanner && (
        <QRCodeScanner
          onScan={handleScan}
          onClose={handleClose}
        />
      )}
    </>
  );
};