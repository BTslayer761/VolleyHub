/**
 * Authentication Service Interface
 * Defined by: Developer 1
 * Used by: Developer 2, Developer 3
 * 
 * This interface defines the contract for authentication services.
 * Other developers should implement mock versions of this during development,
 * then replace with real implementation during integration.
 */

export type UserRole = 'user' | 'administrator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: Date;
}

export interface AuthService {
  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get the current authenticated user
   * Returns null if not authenticated
   */
  getCurrentUser(): User | null;

  /**
   * Check if current user has a specific role
   */
  hasRole(role: UserRole): boolean;

  /**
   * Get authentication token (JWT or similar)
   * Returns null if not authenticated
   */
  getAuthToken(): string | null;

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Promise<User>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Register new user
   */
  register(email: string, password: string, name: string): Promise<User>;
}
