/**
 * Court Service Interface
 * Defined by: Developer 2
 * Used by: Developer 3
 * 
 * This interface defines the contract for court data and services.
 * Developer 3 should implement a mock version during development,
 * then replace with real implementation during integration.
 */

export type CourtType = 'outdoor' | 'indoor';
export type BookingMode = 'fcfs' | 'priority';

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  
  // Indoor court specific
  maxSlots?: number;           // For indoor courts
  bookingMode?: BookingMode;   // 'fcfs' for ad-hoc, 'priority' for weekly sorting
  deadline?: Date;             // For indoor courts with priority mode
  createdAt?: Date;
}

export interface CourtFilters {
  type?: CourtType;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
}

export interface CourtService {
  /**
   * Get all courts with optional filtering
   */
  getCourts(filters?: CourtFilters): Promise<Court[]>;

  /**
   * Get a single court by ID
   */
  getCourtById(id: string): Promise<Court | null>;

  /**
   * Create a new court (Admin only)
   */
  createCourt(court: Omit<Court, 'id' | 'createdAt'>): Promise<Court>;

  /**
   * Update an existing court (Admin only)
   */
  updateCourt(id: string, court: Partial<Court>): Promise<Court>;

  /**
   * Delete a court (Admin only)
   */
  deleteCourt(id: string): Promise<void>;
}
