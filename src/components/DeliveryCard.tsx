// Update src/components/DeliveryCard.tsx
import { Delivery } from '../types/delivery';
import { StatusBadge } from './StatusBadge';
import { QRCodeGenerator } from './QRCodeGenerator';
import { formatDateShort } from '../utils/statusUtils';
import { MapPin, Calendar, Package, User, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface DeliveryCardProps {
  delivery: Delivery;
  compact?: boolean;
  showQR?: boolean;
}

export const DeliveryCard = ({ 
  delivery, 
  compact = false,
  showQR = false 
}: DeliveryCardProps) => {
  const [showQRCode, setShowQRCode] = useState(false);

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={delivery.status} />
            thhiiis
            <span className="text-sm font-mono text-gray-600">
              {delivery.trackingNumber}ffffffffff
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showQR && (
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Show QR Code"
              >
                <QrCode size={14} className="text-gray-500" />
              </button>
            )}
            <Link
              to={`/deliveries/${delivery.id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View →
            </Link>
          </div>
        </div>
        
        {showQRCode && (
          <div className="mb-3 flex justify-center">
            <QRCodeGenerator delivery={delivery} size={80} showActions={false} />
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-gray-900 font-medium">
            {delivery.package.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User size={12} />
              {delivery.recipient.name}qsdfsqfdsqf
            </span>
            <span className="flex items-center gap-1">
              <Package size={12} />
              {delivery.package.weight}kgdddddddddddd
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 font-mono">
            {delivery.trackingNumber}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {delivery.package.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={delivery.status} />
          {showQR && (
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              title="Show QR Code"
            >
              <QrCode size={16} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

        <div className="mb-4 flex justify-center">
          <QRCodeGenerator delivery={delivery} size={120} showActions={false} />
        </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>
            {delivery.sender.name} → {delivery.recipient.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package size={16} />
          <span>
            {delivery.package.weight}kg • {delivery.package.dimensions}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Est. delivery: {formatDateShort(delivery.estimatedDelivery)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {delivery.timeline.length} update{delivery.timeline.length !== 1 ? 's' : ''}
        </span>
        <Link
          to={`/deliveries/${delivery.id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};