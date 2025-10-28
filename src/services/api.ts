// src/services/api.ts
import axios from 'axios';
import { Delivery, DeliveryStats, CreateDeliveryRequest, UpdateDeliveryStatusRequest, DeliveryStatus } from '../types/delivery';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deliveryApi = {
  // Get all deliveries
  getAllDeliveries: async (): Promise<Delivery[]> => {
    const response = await api.get('/deliveries');
    return response.data.data;
  },

  // Get delivery by ID
  getDeliveryById: async (id: string): Promise<Delivery> => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data.data;
  },

  // Get delivery by tracking number
  getDeliveryByTrackingNumber: async (trackingNumber: string): Promise<Delivery> => {
    const response = await api.get(`/deliveries/tracking/${trackingNumber}`);
    return response.data.data;
  },

  // Create new delivery
  createDelivery: async (deliveryData: CreateDeliveryRequest): Promise<Delivery> => {
    const response = await api.post('/deliveries', deliveryData);
    return response.data.data;
  },

  // Update delivery status
  updateDeliveryStatus: async (id: string, updateData: UpdateDeliveryStatusRequest): Promise<Delivery> => {
    const response = await api.patch(`/deliveries/${id}/status`, updateData);
    return response.data.data;
  },

  // Delete delivery
  deleteDelivery: async (id: string): Promise<void> => {
    await api.delete(`/deliveries/${id}`);
  },

  // Get delivery statistics
  getDeliveryStats: async (): Promise<DeliveryStats> => {
    const response = await api.get('/deliveries/stats');
    return response.data.data;
  },

  // Get deliveries by status
  getDeliveriesByStatus: async (status: DeliveryStatus): Promise<Delivery[]> => {
    const response = await api.get(`/deliveries/status/${status}`);
    return response.data.data;
  },
};