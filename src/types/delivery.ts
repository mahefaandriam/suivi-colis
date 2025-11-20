// src/types/delivery.ts
export type DeliveryStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface Delivery {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  createdBy: string;
  sender: {
    name: string;
    address: string;
  };
  recipient: {
    name: string;
    address: string;
    phone: string;
    localisation: string;
  };
  package: {
    weight: number;
    dimensions: string;
    description: string;
  };
  driverEmail?: string;
  timeline: TimelineEvent[];
  estimatedDelivery: string;
  currentLocation?: string;
  colisTheme?: string;
  driverId?: string;
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

export interface CreateDeliveryRequest {
  sender: {
    name: string;
    address: string;
  };
  recipient: {
    name: string;
    address: string;
    phone: string;
    localisation: string;
    email: string;
  };
  package: {
    weight: number;
    dimensions: string;
    description: string;
  };
  driverEmail?: string;
  estimatedDelivery: string;
  driverId?: string;
  colisTheme?: string;
}

export interface UpdateDeliveryStatusRequest {
  status: DeliveryStatus;
  location: string;
  description: string;
}

export interface DeliveryDriverLocation {
  id: string; //deliveries ID
  created_by: string; //user ID who created the delivery
  driver_id: string;
  driver_email: string;
  driver_last_update: string; // or Date if you parse it

  tracking_number: string;
  status: DeliveryStatus;

  sender_name: string;
  sender_address: string;

  recipient_name: string;
  recipient_address: string;
  recipient_email: string;
  recipient_localisation: string; // "-18.89, 47.50"
  recipient_phone: string;

  package_description: string;
  package_weight: number; // parsed from string

  estimated_delivery: string; // or Date

  lat: number; //driver localisation 
  lng: number;
  speed: number;
  heading: number;

  colis_theme?: string;

  is_online: boolean;
  role: 'driver' | 'admin' | 'user';

  // Extra helper fields if needed later:
  // position?: { lat: number; lng: number };
}