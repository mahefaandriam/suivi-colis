// src/utils/statusUtils.ts
import { DeliveryStatus } from '../types/delivery';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

export const getStatusConfig = (status: DeliveryStatus) => {
  const config = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      label: 'Pending',
      progress: 20,
    },
    in_transit: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Truck,
      label: 'In Transit',
      progress: 50,
    },
    out_for_delivery: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Package,
      label: 'Out for Delivery',
      progress: 80,
    },
    delivered: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Delivered',
      progress: 100,
    },
    failed: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      label: 'Failed',
      progress: 100,
    },
  };

  return config[status];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};