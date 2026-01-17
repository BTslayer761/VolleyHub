/**
 * Mock Authentication Service for Developer 2
 * This is a temporary mock that will be replaced with real auth during integration
 */

import { AuthService, User, UserRole } from '@/shared/types/auth.types';

// Mock user - Administrator for court posting
const mockAdminUser: User = {
  id: 'admin-1',
  email: 'admin@volleyhub.com',
  name: 'Admin User',
  role: 'administrator',
};

export const mockAuthService: AuthService = {
  isAuthenticated: () => true, // For dev purposes, always authenticated
  getCurrentUser: () => mockAdminUser, // Always returns admin for Developer 2
  hasRole: (role: UserRole) => role === 'administrator', // Always admin
  getAuthToken: () => 'mock-jwt-token',
  login: async (email: string, password: string) => mockAdminUser,
  logout: async () => {},
  register: async (email: string, password: string, name: string) => mockAdminUser,
};
