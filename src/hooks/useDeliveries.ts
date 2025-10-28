// src/hooks/useDeliveries.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { deliveryApi } from '../services/api';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryStatusRequest, DeliveryStatus } from '../types/delivery';

export const useDeliveries = () => {
  return useQuery('deliveries', deliveryApi.getAllDeliveries);
};

export const useDelivery = (id: string) => {
  return useQuery(['delivery', id], () => deliveryApi.getDeliveryById(id), {
    enabled: !!id,
  });
};

export const useDeliveryByTracking = (trackingNumber: string) => {
  return useQuery(
    ['delivery', trackingNumber],
    () => deliveryApi.getDeliveryByTrackingNumber(trackingNumber),
    {
      enabled: !!trackingNumber,
      retry: false,
    }
  );
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (deliveryData: CreateDeliveryRequest) => deliveryApi.createDelivery(deliveryData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deliveries');
        queryClient.invalidateQueries('stats');
      },
    }
  );
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updateData }: { id: string; updateData: UpdateDeliveryStatusRequest }) =>
      deliveryApi.updateDeliveryStatus(id, updateData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('deliveries');
        queryClient.invalidateQueries(['delivery', data.id]);
        queryClient.invalidateQueries('stats');
      },
    }
  );
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => deliveryApi.deleteDelivery(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deliveries');
        queryClient.invalidateQueries('stats');
      },
    }
  );
};

export const useDeliveryStats = () => {
  return useQuery('stats', deliveryApi.getDeliveryStats);
};

export const useDeliveriesByStatus = (status: DeliveryStatus) => {
  return useQuery(
    ['deliveries', status],
    () => deliveryApi.getDeliveriesByStatus(status),
    {
      enabled: !!status,
    }
  );
};