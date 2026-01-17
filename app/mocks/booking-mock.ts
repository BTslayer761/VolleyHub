/**
 * Mock Booking Service for Developer 3
 * 
 * This is a mock implementation of the BookingService interface.
 * In production, this will be replaced with real API calls to the backend.
 * 
 * Purpose: Allow development and testing of the booking UI without a backend.
 */

import { BookingService, Booking, Participant, BookingStatus } from '@/shared/types/booking.types';

// Mock booking data - stored in memory for development
const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-123',
    courtId: 'court-outdoor-1',
    isGoing: true, // Outdoor court - simple RSVP
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: 'booking-2',
    userId: 'user-123',
    courtId: 'court-indoor-1',
    slotIndex: 3, // Indoor court - assigned slot 3
    status: 'confirmed',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-24'),
  },
  {
    id: 'booking-3',
    userId: 'user-123',
    courtId: 'court-indoor-2',
    status: 'pending', // Indoor court - pending assignment
    createdAt: new Date('2026-01-19'),
  },
];

export const mockBookingService: BookingService = {
  /**
   * Get all bookings for a specific user
   */
  getUserBookings: async (userId: string) => {
    return mockBookings.filter((booking) => booking.userId === userId);
  },

  /**
   * Create booking/RSVP for outdoor court
   */
  createOutdoorBooking: async (courtId: string, userId: string) => {
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId,
      courtId,
      isGoing: true,
      createdAt: new Date(),
    };
    mockBookings.push(newBooking);
    return newBooking;
  },

  /**
   * Remove outdoor booking/RSVP
   */
  cancelOutdoorBooking: async (courtId: string, userId: string) => {
    const index = mockBookings.findIndex(
      (b) => b.courtId === courtId && b.userId === userId && b.isGoing
    );
    if (index !== -1) {
      mockBookings.splice(index, 1);
    }
  },

  /**
   * Request indoor court slot
   */
  requestIndoorSlot: async (courtId: string, userId: string) => {
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId,
      courtId,
      status: 'pending',
      createdAt: new Date(),
    };
    mockBookings.push(newBooking);
    return newBooking;
  },

  /**
   * Cancel indoor slot booking
   */
  cancelIndoorBooking: async (bookingId: string) => {
    const index = mockBookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      mockBookings.splice(index, 1);
    }
  },

  /**
   * Get list of participants for a court
   */
  getCourtParticipants: async (courtId: string): Promise<Participant[]> => {
    const courtBookings = mockBookings.filter((b) => b.courtId === courtId);
    
    return courtBookings.map((booking) => ({
      userId: booking.userId,
      userName: 'Mock User', // In real app, fetch from user service
      slotIndex: booking.slotIndex,
      status: booking.status || 'confirmed',
    }));
  },

  /**
   * Get booking status for a specific court and user
   */
  getBookingStatus: async (courtId: string, userId: string) => {
    const booking = mockBookings.find(
      (b) => b.courtId === courtId && b.userId === userId
    );
    return booking || null;
  },
};
