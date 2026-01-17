/**
 * BookingCard Component
 * Displays a single booking with court details and status
 */

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { BookingWithCourt } from '@/app/utils/booking-utils';
import { formatBookingDate, getBookingStatusColor, getBookingStatusText } from '@/app/utils/booking-utils';

interface BookingCardProps {
  bookingWithCourt: BookingWithCourt;
}

export function BookingCard({ bookingWithCourt }: BookingCardProps) {
  const { booking, court } = bookingWithCourt;

  if (!court) return null;

  const statusText = getBookingStatusText(booking, court);
  const statusColor = getBookingStatusColor(booking.status, booking.isGoing);

  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.courtName}>
          {court.name}
        </ThemedText>
        <ThemedView style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedText style={styles.location}>{court.location}</ThemedText>

      <ThemedView style={styles.details}>
        <ThemedText style={styles.detailText}>📅 {formatBookingDate(court.date)}</ThemedText>
        <ThemedText style={styles.detailText}>
          🕐 {court.startTime} - {court.endTime}
        </ThemedText>
        <ThemedText style={styles.detailText}>
          {court.type === 'outdoor' ? '🏖️ Outdoor' : '🏠 Indoor'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  courtName: {
    flex: 1,
    fontSize: 18,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  details: {
    gap: 4,
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
