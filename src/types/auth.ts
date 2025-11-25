// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  created_by?: string; // only driver creation use
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  tokenId: string;
  iat: number;
  exp: number;
}