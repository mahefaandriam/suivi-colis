// src/hooks/useDrivers.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { driverApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';



export const useDriversFind = (email: string) => {
  const { user } = useAuth();
  return useQuery(
    ['driveEmail', email, user?.id], // Include user ID in query key
    () => driverApi.getDriverByEmail(email),
    {
      enabled: !!user && !!email,
    }
  );
};

export const useDriverByAdmin = (AdminId: string) => {
  const { user } = useAuth();
  return useQuery(
    ['drivers', user?.id], // Include user ID in query key for user-specific caching
    () => driverApi.getDriversByAdmin(AdminId),
    {
      enabled: !!user, // Only fetch if user is authenticated
    }
  );
};