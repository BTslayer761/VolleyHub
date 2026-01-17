/**
 * BookingList Component
 * Displays a list of booking cards
 */

import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';

import { BookingWithCourt } from '@/app/utils/booking-utils';
import { BookingCard } from './booking-card';

interface BookingListProps {
  bookings: BookingWithCourt[];
  onCancel: (bookingId: string, courtId: string, isOutdoor: boolean) => Promise<void>;
}

export function BookingList({ bookings, onCancel }: BookingListProps) {
  return (
    <ThemedView style={styles.container}>
      {bookings.map(({ booking, court }) => (
        <BookingCard
          key={booking.id}
          bookingWithCourt={{ booking, court }}
          onCancel={onCancel}
        />
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
