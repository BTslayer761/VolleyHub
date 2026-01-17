/**
 * Mock Auth Service for Developer 3
 * 
 * This is a TEMPORARY mock implementation that matches the AuthService interface.
 * During integration, this will be replaced with the real AuthContext from Developer 1.
 * 
 * Purpose: Allow Developer 3 to work independently without waiting for Developer 1's auth implementation.
 */

import { AuthService, User } from '@/shared/types/auth.types';

export const mockAuthService: AuthService = {
  /**
   * Check if user is authenticated
   * For dev purposes, always returns true
   */
  isAuthenticated: () => true,

  /**
   * Get the current user
   * Returns a mock user with ID for testing bookings
   */
  getCurrentUser: () => ({
    id: 'user-123',
    email: 'dev@volleyhub.com',
    name: 'Developer 3',
    role: 'user', // Regular user (not admin)
    createdAt: new Date(),
  }),

  /**
   * Check if current user has a specific role
   */
  hasRole: (role) => role === 'user',

  /**
   * Get authentication token
   * Returns mock token for API calls
   */
  getAuthToken: () => 'mock-jwt-token-for-dev-3',

  /**
   * Login (mock implementation)
   * In real app, this would authenticate with backend
   */
  login: async (email: string, password: string) => {
    return mockAuthService.getCurrentUser()!;
  },

  /**
   * Logout (mock implementation)
   */
  logout: async () => {
    // In real app, this would clear tokens, etc.
    console.log('Mock logout called');
  },

  /**
   * Register (mock implementation)
   * In real app, this would create a new user account
   */
  register: async (email: string, password: string, name: string) => {
    return {
      id: 'new-user-456',
      email,
      name,
      role: 'user' as const,
      createdAt: new Date(),
    };
  },
};
