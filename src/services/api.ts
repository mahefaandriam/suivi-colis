// src/services/api.ts
import axios from 'axios';
import { Delivery, DeliveryStats, CreateDeliveryRequest, UpdateDeliveryStatusRequest, DeliveryStatus, DeliveryDriverLocation } from '../types/delivery';

const API_BASE_URL = 'http://localhost:3004/api';

// Create axios instance with interceptors (already set up in authService)
import api from './authService';
import { User } from '@/types/auth';

export const deliveryApi = {
  // Get all deliveries (user-specific)
  getAllDeliveries: async (): Promise<Delivery[]> => {
    const response = await api.get('/deliveries');
    return response.data.data;
  },

  // Get all deliveries including driver info (admin only)
  getAllDeliveriesWithDriverInfo: async (): Promise<Delivery[]> => {
    const response = await api.get('/deliveries/drivers');
    console.log('Réponse du serveur pour les livraisons avec info livreur :', response);
    return response.data.data;
  },

  
  // Get deliveries for a specific driver (driver only)
  getDeliveriesByDriverId: async (driverId: string): Promise<DeliveryDriverLocation[]> => {
    const response = await api.get(`/deliveries/driver/${driverId}`);    
    return response.data;
  },

  // Get delivery by ID (user-specific)
  getDeliveryById: async (id: string): Promise<Delivery> => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data.data;
  },

  // Get delivery by tracking number (user-specific)
  getDeliveryByTrackingNumber: async (trackingNumber: string): Promise<Delivery> => {
    const response = await api.get(`/deliveries/tracking/${trackingNumber}`);
    return response.data.data;
  },

  // Create new delivery (for current user)
  createDelivery: async (deliveryData: CreateDeliveryRequest): Promise<Delivery> => {
    const response = await api.post('/deliveries', deliveryData);
    return response.data.data;
  },

  // Update delivery status (user-specific)
  updateDeliveryStatus: async (id: string, updateData: UpdateDeliveryStatusRequest): Promise<Delivery> => {
    const response = await api.patch(`/deliveries/${id}/status`, updateData);
    return response.data.data;
  },

  // Delete delivery (user-specific)
  deleteDelivery: async (id: string): Promise<void> => {
    await api.delete(`/deliveries/${id}`);
  },

  // Get delivery statistics (user-specific)
  getDeliveryStats: async (): Promise<DeliveryStats> => {
    const response = await api.get('/deliveries/stats');
    return response.data.data;
  },

  // Get deliveries by status (user-specific)
  getDeliveriesByStatus: async (status: DeliveryStatus): Promise<Delivery[]> => {
    const response = await api.get(`/deliveries/status/${status}`);
    return response.data.data;
  },

  // Get user Id by email admin only
  getUserIdByEmail: async (email: string): Promise<any> => {
    const response = await api.get(`/auth/${email}`);
    console.log("the email found " , response)
    return response.data.data;
  },

};

export const driverApi = {
  // Get driver by email (user-specific)
  getDriverByEmail: async (email: string): Promise<User> => {
    const response = await api.get(`/drivers/email/${email}`);
    return response.data.data;
  },

  // Get deliveries driver location by delivery ID (user-specific)
  getDriverLocationById: async (driverId: string): Promise<{ lat: number; lng: number }> => {
    const response = await api.get(`/deliveries/location/driver/${driverId}`);
    return response.data.data;
  },

  // Find active drivers by email (admin only)
  findActiveDriversByEmail: async (email: string): Promise<{ id: string; name: string; email: string }[]> => {
    const response = await api.get(`/admin/drivers/active`, {
      params: { email },
    });
    return response.data.data;
  },

  // Update driver location (user-specific)
  updateDriverLocation: async (driverId: string, lat: number, lng: number): Promise<void> => {
    await api.post(`/drivers/location/update`, { driverId, lat, lng });
  },
};