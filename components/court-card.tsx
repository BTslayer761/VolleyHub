import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Court } from '@/shared/types/court.types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Booking components
import { OutdoorBookingButton } from '@/components/booking/outdoor-booking-button';
import { IndoorBookingButton } from '@/components/booking/indoor-booking-button';
import { ParticipantsList } from '@/components/booking/participants-list';

interface CourtCardProps {
  court: Court;
  onBookingChange?: () => void; // Optional callback when booking changes (for Home screen refresh)
}

export default function CourtCard({ court, onBookingChange }: CourtCardProps) {
  const colorScheme = useColorScheme();
  const [refreshKey, setRefreshKey] = useState(0);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time;
  };

  // Handle booking changes to refresh participants list and notify parent (for Home screen)
  const handleBookingChange = () => {
    setRefreshKey((prev) => prev + 1);
    // Notify parent component (Home screen) to refresh bookings list
    onBookingChange?.();
  };

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: Colors[colorScheme ?? 'light'].icon + '20',
        },
      ]}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.courtName}>
          {court.name}
        </ThemedText>
        <ThemedView
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                court.type === 'outdoor'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)',
            },
          ]}>
          <ThemedText
            style={[
              styles.typeText,
              {
                color: court.type === 'outdoor' ? '#22c55e' : '#3b82f6',
              },
            ]}>
            {court.type === 'outdoor' ? 'Outdoor' : 'Indoor'}
          </ThemedText>
        </ThemedView>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Location:</ThemedText>
          <ThemedText style={styles.detailValue}>{court.location}</ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Date:</ThemedText>
          <ThemedText style={styles.detailValue}>{formatDate(court.date)}</ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Time:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {formatTime(court.startTime)} - {formatTime(court.endTime)}
          </ThemedText>
        </View>

        {court.type === 'indoor' && court.maxSlots && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Max Slots:</ThemedText>
            <ThemedText style={styles.detailValue}>{court.maxSlots} people</ThemedText>
          </View>
        )}
      </View>

      {/* Booking Button */}
      <View style={styles.bookingSection}>
        {court.type === 'outdoor' ? (
          <OutdoorBookingButton court={court} onBookingChange={handleBookingChange} />
        ) : (
          <IndoorBookingButton court={court} onBookingChange={handleBookingChange} />
        )}
      </View>

      {/* Participants List */}
      <View style={styles.participantsSection} key={`participants-${refreshKey}`}>
        <ParticipantsList court={court} showTitle={true} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  bookingSection: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  participantsSection: {
    marginTop: 12,
  },
});
