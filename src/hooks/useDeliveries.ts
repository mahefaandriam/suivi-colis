// src/hooks/useDeliveries.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { deliveryApi } from '../services/api';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryStatusRequest, DeliveryStatus } from '../types/delivery';
import { useAuth } from '../contexts/AuthContext';

export const useDeliveries = () => {
  const { user } = useAuth();
  return useQuery(
    ['deliveries', user?.id], // Include user ID in query key for user-specific caching
    deliveryApi.getAllDeliveries,
    {
      enabled: !!user, // Only fetch if user is authenticated
    }
  );
};

export const useDelivery = (id: string) => {
  const { user } = useAuth();
  return useQuery(
    ['delivery', id, user?.id], // Include user ID in query key
    () => deliveryApi.getDeliveryById(id),
    {
      enabled: !!user && !!id,
    }
  );
};

export const useDeliveryByTracking = (trackingNumber: string) => {
  const { user } = useAuth();
  return useQuery(
    ['delivery', trackingNumber, user?.id], // Include user ID in query key
    () => deliveryApi.getDeliveryByTrackingNumber(trackingNumber),
    {
      enabled: !!user && !!trackingNumber,
      retry: false,
    }
  );
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    (deliveryData: CreateDeliveryRequest) => deliveryApi.createDelivery(deliveryData),
    {
      onSuccess: () => {
        // Invalidate user-specific queries
        queryClient.invalidateQueries(['deliveries', user?.id]);
        queryClient.invalidateQueries(['stats', user?.id]);
      },
    }
  );
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    ({ id, updateData }: { id: string; updateData: UpdateDeliveryStatusRequest }) =>
      deliveryApi.updateDeliveryStatus(id, updateData),
    {
      onSuccess: (data) => {
        // Invalidate user-specific queries
        queryClient.invalidateQueries(['deliveries', user?.id]);
        queryClient.invalidateQueries(['delivery', data.id, user?.id]);
        queryClient.invalidateQueries(['stats', user?.id]);
      },
    }
  );
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    (id: string) => deliveryApi.deleteDelivery(id),
    {
      onSuccess: () => {
        // Invalidate user-specific queries
        queryClient.invalidateQueries(['deliveries', user?.id]);
        queryClient.invalidateQueries(['stats', user?.id]);
      },
    }
  );
};

export const useDeliveryStats = () => {
  const { user } = useAuth();
  return useQuery(
    ['stats', user?.id], // Include user ID in query key
    deliveryApi.getDeliveryStats,
    {
      enabled: !!user,
    }
  );
};

export const useDeliveriesByStatus = (status: DeliveryStatus) => {
  const { user } = useAuth();
  return useQuery(
    ['deliveries', status, user?.id], // Include user ID in query key
    () => deliveryApi.getDeliveriesByStatus(status),
    {
      enabled: !!user && !!status,
    }
  );
};