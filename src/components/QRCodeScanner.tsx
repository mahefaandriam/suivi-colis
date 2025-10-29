// src/components/QRCodeScanner.tsx
import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, X, Camera, CameraOff, Scan } from 'lucide-react';
import { QRCodeData, ScanResult } from '../types/qr';

interface QRCodeScannerProps {
  onScan: (result: ScanResult) => void;
  onClose: () => void;
}

export const QRCodeScanner = ({ onScan, onClose }: QRCodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanner = async () => {
    try {
      setCameraError('');
      console.log('Starting QR code scanner...');
      console.log(scannerContainerRef.current);
      if (!scannerContainerRef.current) return;
      
      setIsScanning(true);

      // Check camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      scannerRef.current = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [],
          rememberLastUsedCamera: true,
        },
        false
      );

      await scannerRef.current.render(
        (decodedText) => {
          try {
            const qrData: QRCodeData = JSON.parse(decodedText);
            
            // Validate QR code data structure
            if (qrData.type === 'delivery' && qrData.trackingNumber && qrData.deliveryId) {
              onScan({ success: true, data: qrData });
              stopScanner();
            } else {
              onScan({ 
                success: false, 
                error: 'Invalid QR code format' 
              });
            }
          } catch (error) {
            onScan({ 
              success: false, 
              error: 'Invalid QR code data' 
            });
          }
        },
        (error) => {
          // Ignore scanning errors as they're normal during scanning
          console.debug('QR scanning error:', error);
        }
      );

    } catch (error: any) {
      console.error('Failed to start scanner:', error);
      setCameraError(
        error.name === 'NotAllowedError' 
          ? 'Camera access denied. Please allow camera permissions.'
          : 'Failed to access camera. Please ensure your device has a camera and try again.'
      );
      setHasPermission(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Scan size={20} className="text-card-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">Scan QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4">
          {cameraError ? (
            <div className="text-center py-8">
              <CameraOff size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">Camera Error</p>
              <p className="text-gray-600 text-sm mb-4">{cameraError}</p>
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-primary-600 text-black rounded-md hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Scanner Container */}
              <div 
                id="qr-scanner-container"
                ref={scannerContainerRef}
                className="w-full bg-background rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center"
              >
                {!isScanning && (
                  <div className="text-center p-8">
                    <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      Click start to begin scanning delivery QR codes
                    </p>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={toggleScanner}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
                    isScanning
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'text-primary-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <CameraOff size={20} />
                      Stop Scanning
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Start Scanning
                    </>
                  )}
                </button>

                {isScanning && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Scanning...
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      Point your camera at a delivery QR code
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-card p-4 border-t">
          <h3 className="text-sm font-medium text-card-foreground">How to use:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click "Start Scanning" to activate your camera</li>
            <li>• Point your camera at a delivery QR code</li>
            <li>• Hold steady until the code is recognized</li>
            <li>• The delivery details will open automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};