/**
 * Custom hook for fetching and managing user bookings
 * Separates data fetching logic from UI components
 */

import { useEffect, useState, useCallback } from 'react';

// Mock services (temporary - will be replaced with real services during integration)
import { mockAuthService as mockUserAuthService } from '@/app/mocks/auth-mock';
import { mockBookingService } from '@/app/mocks/booking-mock';
import { courtService } from '@/lib/services/court-service';

import { BookingWithCourt } from '@/app/utils/booking-utils';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user (using user auth service for bookings)
      const user = mockUserAuthService.getCurrentUser();
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Fetch user's bookings
      const userBookings = await mockBookingService.getUserBookings(user.id);

      // Fetch court details for each booking
      const bookingsWithCourts = await Promise.all(
        userBookings.map(async (booking) => {
          const court = await courtService.getCourtById(booking.courtId);
          return { booking, court };
        })
      );

      // Sort by date (upcoming first)
      bookingsWithCourts.sort((a, b) => {
        if (!a.court || !b.court) return 0;
        return a.court.date.getTime() - b.court.date.getTime();
      });

      setBookings(bookingsWithCourts);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load bookings');
      setError(error);
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /**
   * Cancel an outdoor court booking (RSVP)
   */
  const cancelOutdoorBooking = async (courtId: string) => {
    try {
      const user = mockUserAuthService.getCurrentUser();
      if (!user) return;

      await mockBookingService.cancelOutdoorBooking(courtId, user.id);
      // Reload bookings after cancellation
      await loadBookings();
    } catch (err) {
      console.error('Error canceling outdoor booking:', err);
      throw err;
    }
  };

  /**
   * Cancel an indoor court booking
   */
  const cancelIndoorBooking = async (bookingId: string) => {
    try {
      await mockBookingService.cancelIndoorBooking(bookingId);
      // Reload bookings after cancellation
      await loadBookings();
    } catch (err) {
      console.error('Error canceling indoor booking:', err);
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: loadBookings,
    cancelOutdoorBooking,
    cancelIndoorBooking,
  };
}
