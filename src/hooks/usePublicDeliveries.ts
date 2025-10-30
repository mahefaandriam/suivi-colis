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

export const usePublicDeliveryByTracking = (trackingNumber: string) => {
  return useQuery(
    ['public-delivery', trackingNumber],
    () => publicDeliveryApi.getDeliveryByTrackingNumber(trackingNumber),
    {
      enabled: !!trackingNumber,
      retry: false,
    }
  );
};