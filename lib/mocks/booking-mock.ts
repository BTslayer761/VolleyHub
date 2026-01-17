/**
 * Mock Booking Service for Developer 3
 * 
 * This is a mock implementation of the BookingService interface.
 * In production, this will be replaced with real API calls to the backend.
 * 
 * Purpose: Allow development and testing of the booking UI without a backend.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { BookingService, Booking, Participant, BookingStatus } from '@/shared/types/booking.types';

// Helper function to get user name from Firestore
const getUserName = async (userId: string): Promise<string> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.name || 'User';
    }
    // Fallback if user document doesn't exist
    return 'User';
  } catch (error) {
    console.error('Error fetching user name from Firestore:', error);
    return 'User';
  }
};

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
   * For FCFS mode: immediately confirms and assigns slot
   * For Priority mode: creates pending booking (no slot assigned yet)
   */
  requestIndoorSlot: async (courtId: string, userId: string, bookingMode?: 'fcfs' | 'priority') => {
    // For FCFS mode: assign slot immediately (like outdoor court behavior)
    if (bookingMode === 'fcfs') {
      // Get all confirmed bookings for this court to find next available slot
      const courtBookings = mockBookings.filter(
        (b) => b.courtId === courtId && b.slotIndex !== undefined && b.status === 'confirmed'
      );
      
      // Find the highest slot index
      const maxSlotIndex = courtBookings.reduce((max, b) => {
        return b.slotIndex !== undefined && b.slotIndex > max ? b.slotIndex : max;
      }, -1);
      
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        userId,
        courtId,
        status: 'confirmed',
        slotIndex: maxSlotIndex + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBookings.push(newBooking);
      return newBooking;
    }
    
    // For Priority mode (or undefined): create pending booking
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
    
    // Fetch user names for all participants
    const participants = await Promise.all(
      courtBookings.map(async (booking) => {
        const userName = await getUserName(booking.userId);
        return {
          userId: booking.userId,
          userName: userName,
          slotIndex: booking.slotIndex,
          status: booking.status || 'confirmed',
        };
      })
    );
    
    return participants;
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

  /**
   * Move a participant to a different slot position (Admin only)
   * For indoor courts - reorders slot assignments
   */
  moveParticipant: async (courtId: string, userId: string, newSlotIndex: number) => {
    const booking = mockBookings.find(
      (b) => b.courtId === courtId && b.userId === userId
    );
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Get all bookings for this court that have slot indices
    const courtBookings = mockBookings.filter(
      (b) => b.courtId === courtId && b.slotIndex !== undefined
    );
    
    const oldSlotIndex = booking.slotIndex;
    
    // If moving to a position that's already occupied, swap or shift
    const targetBooking = courtBookings.find((b) => b.slotIndex === newSlotIndex && b.id !== booking.id);
    
    if (targetBooking && oldSlotIndex !== undefined) {
      // Swap slots
      targetBooking.slotIndex = oldSlotIndex;
      targetBooking.updatedAt = new Date();
    } else {
      // Shift other participants
      if (oldSlotIndex !== undefined && newSlotIndex < oldSlotIndex) {
        // Moving up - shift participants down
        courtBookings.forEach((b) => {
          if (b.slotIndex !== undefined && b.slotIndex >= newSlotIndex && b.slotIndex < oldSlotIndex && b.id !== booking.id) {
            b.slotIndex = (b.slotIndex || 0) + 1;
            b.updatedAt = new Date();
          }
        });
      } else if (oldSlotIndex !== undefined && newSlotIndex > oldSlotIndex) {
        // Moving down - shift participants up
        courtBookings.forEach((b) => {
          if (b.slotIndex !== undefined && b.slotIndex > oldSlotIndex && b.slotIndex <= newSlotIndex && b.id !== booking.id) {
            b.slotIndex = (b.slotIndex || 0) - 1;
            b.updatedAt = new Date();
          }
        });
      }
    }
    
    // Update the booking's slot index
    booking.slotIndex = newSlotIndex;
    booking.updatedAt = new Date();
  },
};
