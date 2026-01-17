/**
 * BookingList Component
 * Displays a list of courts using CourtCard component
 * Shows courts that the user has bookings for
 */

import { StyleSheet } from 'react-native';

import CourtCard from '@/components/court-card';
import { ThemedView } from '@/components/themed-view';

import { BookingWithCourt } from '@/lib/utils/booking-utils';

interface BookingListProps {
  bookings: BookingWithCourt[];
  onRefresh?: () => void; // Callback to refresh bookings list
}

export function BookingList({ bookings, onRefresh }: BookingListProps) {
  return (
    <ThemedView style={styles.container}>
      {bookings
        .filter(({ court }) => court !== null) // Filter out null courts
        .map(({ booking, court }) => (
          <CourtCard key={booking.id} court={court!} onBookingChange={onRefresh} />
        ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 20,
  },
});
