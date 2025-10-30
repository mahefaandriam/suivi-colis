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

      if (!scannerContainerRef.current) return;

      setIsScanning(true);

      // Vérifier les permissions de la caméra
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

            // Validation de la structure du QR code
            if (qrData.type === 'delivery' && qrData.trackingNumber && qrData.deliveryId) {
              onScan({ success: true, data: qrData });
              stopScanner();
              onClose();
            } else {
              onScan({
                success: false,
                error: 'Format de code QR invalide'
              });
            }
          } catch (error) {
            onScan({
              success: false,
              error: 'Données du code QR invalides'
            });
          }
        },
        (error) => {
          // Ignorer les erreurs normales pendant le scan
          console.debug('Erreur de scan du QR:', error);
        }
      );

    } catch (error: any) {
      console.error('Échec du démarrage du scanner :', error);
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'Accès à la caméra refusé. Veuillez autoriser l’accès à la caméra.'
          : 'Impossible d’accéder à la caméra. Vérifiez que votre appareil dispose d’une caméra et réessayez.'
      );
      setHasPermission(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        // Nettoyer le scanner
        await scanner.clear();
      } catch (error) {
        console.error('Erreur lors de l’arrêt du scanner :', error);
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
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Scan size={20} className="text-card-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">Scanner un code QR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Contenu du scanner */}
        <div className="p-4">
          {cameraError ? (
            <div className="text-center py-8">
              <CameraOff size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">Erreur de caméra</p>
              <p className="text-gray-600 text-sm mb-4">{cameraError}</p>
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-primary-600 text-black rounded-md hover:bg-primary-700"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              {/* Conteneur du scanner */}
              <div
                id="qr-scanner-container"
                ref={scannerContainerRef}
                className="w-full bg-white/60 bg-none rounded-lg overflow-hidden min-h-[300px]"
              >
                {!isScanning && (
                  <div className="p-8">
                    <QrCode size={48} className="mx-auto border mb-4" />
                    <p className="mb-4">
                      Cliquez sur « Démarrer » pour commencer le scan des codes QR de livraison
                    </p>
                  </div>
                )}
              </div>

              {/* Commandes du scanner */}
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={toggleScanner}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${isScanning
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'text-primary-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  {isScanning ? (
                    <>
                      <CameraOff size={20} />
                      Arrêter le scan
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Démarrer le scan
                    </>
                  )}
                </button>

                {isScanning && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Scan en cours...
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      Pointez votre caméra vers un code QR de livraison
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-card p-4 border-t">
          <h3 className="text-sm font-medium text-card-foreground">Comment utiliser :</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Cliquez sur « Démarrer le scan » → « Autoriser l’accès à la caméra » pour activer la caméra</li>
            <li>• Pointez la caméra vers un code QR de livraison</li>
            <li>• Gardez l’appareil stable jusqu’à ce que le code soit reconnu</li>
            <li>• Les détails de la livraison s’ouvriront automatiquement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
