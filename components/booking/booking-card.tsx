/**
 * BookingCard Component
 * Displays a single booking with court details and status
 */

import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { BookingWithCourt, formatBookingDate, getBookingStatusColor, getBookingStatusText } from '@/app/utils/booking-utils';

interface BookingCardProps {
  bookingWithCourt: BookingWithCourt;
  onCancel: (bookingId: string, courtId: string, isOutdoor: boolean) => Promise<void>;
}

export function BookingCard({ bookingWithCourt, onCancel }: BookingCardProps) {
  const { booking, court } = bookingWithCourt;
  const [isCanceling, setIsCanceling] = useState(false);

  if (!court) return null;

  const statusText = getBookingStatusText(booking, court);
  const statusColor = getBookingStatusColor(booking.status, booking.isGoing);
  const isOutdoor = court.type === 'outdoor';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for ${court.name}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCanceling(true);
              await onCancel(booking.id, court.id, isOutdoor);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
              console.error('Cancel booking error:', error);
            } finally {
              setIsCanceling(false);
            }
          },
        },
      ]
    );
  };

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

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        disabled={isCanceling}
        activeOpacity={0.7}>
        <ThemedText style={styles.cancelButtonText}>
          {isCanceling ? 'Canceling...' : 'Cancel Booking'}
        </ThemedText>
      </TouchableOpacity>
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
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
