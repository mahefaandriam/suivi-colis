// src/services/publicApi.ts
import axios from 'axios';
import { Delivery } from '../types/delivery';

const API_BASE_URL = 'http://localhost:3004/api';

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
  getDeliveryByTrackingNumber: async (trackingNumber: string, logedEmail: string): Promise<Delivery> => {
    console.log("tracking number public api " , trackingNumber, logedEmail)
    const response = await publicApi.get(`/public/deliveries/tracking/${trackingNumber}/${logedEmail}`);
    //console.log("data tacking public " , response)
    return response.data.data;
  },

  // Get delivery by recipient Email (public access)
  getPublicDeliveryByEmail: async (recipientEmail: string): Promise<Delivery> => {
    console.log("Email public api " , recipientEmail)
    const response = await publicApi.get(`/public/deliveries/email/${recipientEmail}`);
    //console.log("data tacking public " , response)
    return response.data.data;
  },
};
