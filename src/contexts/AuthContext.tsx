// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { authApi, tokenService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

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

  const login = async (credentials: LoginCredentials) => {
    console.log("AuthContext login called");
    try {
      const response = await authApi.login(credentials);
      console.log("Login response:", response);
      tokenService.setToken(response.token);
      tokenService.setUser(response.user);
      setUser(response.user);
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
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};