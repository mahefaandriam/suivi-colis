export type DeliveryStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface Delivery {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  sender: {
    name: string;
    address: string;
  };
  recipient: {
    name: string;
    address: string;
    phone: string;
  };
  package: {
    weight: number;
    dimensions: string;
    description: string;
  };
  timeline: TimelineEvent[];
  estimatedDelivery: string;
  currentLocation?: string;
}

export interface TimelineEvent {
  id: string;
  status: DeliveryStatus;
  location: string;
  timestamp: string;
  description: string;
}

export interface DeliveryStats {
  total: number;
  delivered: number;
  inTransit: number;
  pending: number;
  failed: number;
}
