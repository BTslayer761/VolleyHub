/**
 * Booking Service Interface
 * Defined by: Developer 3
 * 
 * This interface defines the contract for booking operations.
 */

export type BookingStatus = 'confirmed' | 'pending' | 'waitlisted' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  
  // For outdoor courts - simple RSVP
  isGoing?: boolean;
  
  // For indoor courts - slot assignment
  slotIndex?: number;      // Assigned slot number
  status?: BookingStatus;  // confirmed, pending, waitlisted
  
  createdAt: Date;
  updatedAt?: Date;
}

export interface Participant {
  userId: string;
  userName: string;
  bookingId?: string;      // Booking ID (for admin operations like deletion)
  slotIndex?: number;      // For indoor courts
  status?: BookingStatus;
  waitlistPosition?: number; // Position in waitlist (1-based, for waitlisted users)
}

export interface BookingService {
  /**
   * Get all bookings for current user
   */
  getUserBookings(userId: string): Promise<Booking[]>;

  /**
   * Create booking/RSVP for outdoor court
   */
  createOutdoorBooking(courtId: string, userId: string): Promise<Booking>;

  /**
   * Remove outdoor booking/RSVP
   */
  cancelOutdoorBooking(courtId: string, userId: string): Promise<void>;

  /**
   * Request indoor court slot
   * @param maxSlots - Maximum number of slots for the court (used for waitlist logic)
   * @param bookingMode - 'fcfs' for immediate assignment, 'priority' for pending
   */
  requestIndoorSlot(courtId: string, userId: string, bookingMode?: 'fcfs' | 'priority', maxSlots?: number): Promise<Booking>;

  /**
   * Cancel indoor slot booking
   * Automatically promotes first waitlisted person if someone cancels from main list
   */
  cancelIndoorBooking(bookingId: string, courtId?: string, maxSlots?: number): Promise<void>;

  /**
   * Get list of participants for a court
   */
  getCourtParticipants(courtId: string): Promise<Participant[]>;

  /**
   * Get booking status for a specific court and user
   */
  getBookingStatus(courtId: string, userId: string): Promise<Booking | null>;

  /**
   * Move a participant to a different slot position (Admin only)
   * For indoor courts - reorders slot assignments
   */
  moveParticipant(courtId: string, userId: string, newSlotIndex: number): Promise<void>;
}
