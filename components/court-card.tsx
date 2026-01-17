import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockAuthService } from '@/lib/mocks/auth-mock';
import { Court, OutdoorCourtStatus } from '@/shared/types/court.types';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Booking components
import { IndoorBookingButton } from '@/components/booking/indoor-booking-button';
import { OutdoorBookingButton } from '@/components/booking/outdoor-booking-button';
import { ParticipantsList } from '@/components/booking/participants-list';
import CourtStatusModal from './court-status-modal';

interface CourtCardProps {
  court: Court;
  onBookingChange?: () => void; // Optional callback when booking changes (for Home screen refresh)
}

export default function CourtCard({ court, onBookingChange }: CourtCardProps) {
  const colorScheme = useColorScheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const isAdmin = mockAuthService.hasRole('administrator');

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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Handle booking changes to refresh participants list and notify parent (for Home screen)
  const handleBookingChange = () => {
    setRefreshKey((prev) => prev + 1);
    // Notify parent component (Home screen) to refresh bookings list
    onBookingChange?.();
  };

  const handleStatusUpdated = () => {
    setRefreshKey((prev) => prev + 1);
    onBookingChange?.(); // Notify parent to refresh court list
  };

  const getStatusColor = (status?: OutdoorCourtStatus): string => {
    if (!status || status === 'available') return '#22c55e'; // Green
    switch (status) {
      case 'rain':
        return '#3b82f6'; // Blue
      case 'cat1':
        return '#ef4444'; // Red
      case 'closed':
        return '#f59e0b'; // Orange
      case 'cancelled':
        return '#6b7280'; // Gray
      default:
        return '#22c55e'; // Green (available)
    }
  };

  const getStatusLabel = (status?: OutdoorCourtStatus): string => {
    if (!status || status === 'available') return 'Available';
    switch (status) {
      case 'rain':
        return 'Rain';
      case 'cat1':
        return 'Category 1';
      case 'closed':
        return 'Closed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Available';
    }
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

        {court.type === 'indoor' && court.bookingMode && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Booking Mode:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {court.bookingMode === 'fcfs' ? 'Ad-hoc (FCFS)' : 'Priority-based'}
            </ThemedText>
          </View>
        )}

        {court.type === 'indoor' && court.bookingMode === 'priority' && court.deadline && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Deadline:</ThemedText>
            <ThemedText style={styles.detailValue}>{formatDateTime(court.deadline)}</ThemedText>
          </View>
        )}

        {/* Outdoor Court Status */}
        {court.type === 'outdoor' && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Status:</ThemedText>
            <ThemedView
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(court.status) + '20' },
              ]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(court.status) }]}>
                {getStatusLabel(court.status)}
              </ThemedText>
            </ThemedView>
          </View>
        )}
      </View>

      {/* Admin: Update Status Button (Outdoor courts only) */}
      {court.type === 'outdoor' && isAdmin && (
        <TouchableOpacity
          style={[
            styles.updateStatusButton,
            {
              backgroundColor:
                colorScheme === 'dark' ? '#0a7ea4' : Colors[colorScheme ?? 'light'].tint,
            },
          ]}
          onPress={() => setIsStatusModalVisible(true)}>
          <ThemedText style={styles.updateStatusButtonText}>Update Status</ThemedText>
        </TouchableOpacity>
      )}

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

      {/* Status Update Modal (Admin only, Outdoor courts) */}
      {court.type === 'outdoor' && isAdmin && (
        <CourtStatusModal
          visible={isStatusModalVisible}
          courtId={court.id}
          courtName={court.name}
          currentStatus={court.status}
          onClose={() => setIsStatusModalVisible(false)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  updateStatusButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateStatusButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
