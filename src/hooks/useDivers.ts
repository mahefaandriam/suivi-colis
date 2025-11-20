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