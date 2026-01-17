/**
 * Custom hook for fetching and managing user bookings
 * Separates data fetching logic from UI components
 */

import { useEffect, useState } from 'react';

// Mock services (temporary - will be replaced with real services during integration)
import { mockAuthService } from '@/app/mocks/auth-mock';
import { mockCourtService } from '@/app/mocks/court-mock';
import { mockBookingService } from '@/app/mocks/booking-mock';

import { BookingWithCourt } from '@/app/utils/booking-utils';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const user = mockAuthService.getCurrentUser();
      if (!user) {
        setBookings([]);
        return;
      }

      // Fetch user's bookings
      const userBookings = await mockBookingService.getUserBookings(user.id);

      // Fetch court details for each booking
      const bookingsWithCourts = await Promise.all(
        userBookings.map(async (booking) => {
          const court = await mockCourtService.getCourtById(booking.courtId);
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
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    refetch: loadBookings,
  };
}
