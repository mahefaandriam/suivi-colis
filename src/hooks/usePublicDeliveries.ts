// src/hooks/usePublicDeliveries.ts
import { useQuery } from 'react-query';
import { publicDeliveryApi } from '../services/publicApi';

export const usePublicDelivery = (id: string) => {
  return useQuery(
    ['public-delivery', id],
    () => publicDeliveryApi.getDeliveryById(id),
    {
      enabled: !!id,
      retry: false,
    }
  );
};

export const usePublicDeliveryByTracking = (trackingNumber: string, logedEmail: string) => {
  return useQuery(
    ['public-delivery', trackingNumber],
    () => publicDeliveryApi.getDeliveryByTrackingNumber(trackingNumber, logedEmail),
    {
      enabled: !!trackingNumber,
      retry: false,
    }
  );
};

// Get delivery by recipient email
export const usePublicDeliveryByEmail = (recipientEmail: string) => {
  return useQuery(
    ['public-delivery', recipientEmail],
    () => publicDeliveryApi.getPublicDeliveryByEmail(recipientEmail),
    {
      enabled: !!recipientEmail,
      retry: false,
    }
  );
};