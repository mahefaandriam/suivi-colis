// src/services/publicApi.ts
import axios from 'axios';
import { Delivery } from '../types/delivery';

const API_BASE_URL = '/api';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicDeliveryApi = {
  // Get delivery by ID (public access)
  getDeliveryById: async (id: string): Promise<Delivery> => {
    const response = await publicApi.get(`/public/deliveries/${id}`);
    return response.data.data;
  },

  // Get delivery by tracking number (public access)
  getDeliveryByTrackingNumber: async (trackingNumber: string): Promise<Delivery> => {
    const response = await publicApi.get(`/public/deliveries/tracking/${trackingNumber}`);
    return response.data.data;
  },
};