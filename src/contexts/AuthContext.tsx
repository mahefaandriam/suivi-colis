// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, UserRole } from '../types/auth';
import { authApi, tokenService } from '../services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAuthorizedDevice: boolean;
  deviceType: 'mobile' | 'desktop' | 'unknown';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Device detection utility
const detectDeviceType = (): 'mobile' | 'desktop' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMobile = isAndroid || isIOS || /mobile/.test(userAgent);
  
  return isMobile ? 'mobile' : 'desktop';
};

// Check if device is authorized for the user role
const isDeviceAuthorizedForRole = (userRole: UserRole, deviceType: 'mobile' | 'desktop' | 'unknown'): boolean => {
  // Drivers can only use mobile devices (specifically Android if needed)
  if (userRole === 'driver') {
    if (deviceType === 'mobile') {
      // Optional: Check for Android specifically
      const isAndroid = /android/.test(navigator.userAgent.toLowerCase());
      return isAndroid; // Only Android authorized for drivers
      // If you want to allow all mobile devices for drivers:
      // return deviceType === 'mobile';
    }
    return false;
  }
  
  // Other roles (admin, customer, etc.) can use any device
  return true;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'unknown'>('unknown');
  const [isAuthorizedDevice, setIsAuthorizedDevice] = useState(true);

  useEffect(() => {
    initializeAuth();
    detectAndSetDeviceType();
  }, []);

  useEffect(() => {
    // Update authorization when user or device changes
    if (user) {
      const authorized = isDeviceAuthorizedForRole(user.role, deviceType);
      setIsAuthorizedDevice(authorized);
      
      // Optional: Auto logout if unauthorized device for driver
      if (user.role === 'driver' && !authorized) {
        handleUnauthorizedDevice();
      }
    }
  }, [user, deviceType]);

  const detectAndSetDeviceType = () => {
    const detectedType = detectDeviceType();
    setDeviceType(detectedType);
  };

  const initializeAuth = async () => {
    const token = tokenService.getToken();
    const savedUser = tokenService.getUser();

    if (token && savedUser) {
      if (tokenService.isTokenExpired(token)) {
        // Token expired, logout
        await logout();
      } else {
        // Token valid, set user and verify with backend
        setUser(savedUser);
        try {
          await authApi.getProfile();
        } catch (error) {
          // Token invalid on server, logout
          await logout();
        }
      }
    }
    
    setIsLoading(false);
  };

  const handleUnauthorizedDevice = () => {
    // You can either:
    // 1. Logout immediately
    // logout();
    
    // 2. Show a message and prevent further actions
    console.warn('Unauthorized device for driver. Only Android devices are allowed.');

    
    // 3. Set a state that can be used to show an error UI
    // This is already handled by isAuthorizedDevice state
  };

  const login = async (credentials: LoginCredentials) => {
    console.log("AuthContext login called");
    try {
      const response = await authApi.login(credentials);
      console.log("Login response:", response);
      
      // Check device authorization before proceeding
      const userRole = response.user.role;
      const isAuthorized = isDeviceAuthorizedForRole(userRole, deviceType);
      
      if (!isAuthorized) {
        tokenService.removeToken();
        throw new Error(
          userRole === 'driver' 
            ? 'Drivers can only log in from Android mobile devices.' 
            : 'Unauthorized device for this user role.'
        );
      }
      
      tokenService.setToken(response.token);
      tokenService.setUser(response.user);
      setUser(response.user);
      setIsAuthorizedDevice(true);
    } catch (error) {
      throw error;
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData);
      // You can automatically log the user in after registration if desired
      // For now, we'll just return success
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenService.removeToken();
      setUser(null);
      setIsAuthorizedDevice(true); // Reset to default
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAuthorizedDevice,
    deviceType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};