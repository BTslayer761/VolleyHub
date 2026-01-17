import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { courtService } from '@/lib/services/court-service';
import { Court, OutdoorCourtStatus } from '@/shared/types/court.types';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

// Booking components
import { IndoorBookingButton } from '@/components/booking/indoor-booking-button';
import { OutdoorBookingButton } from '@/components/booking/outdoor-booking-button';
import { ParticipantsList } from '@/components/booking/participants-list';
import CourtStatusModal from './court-status-modal';

// Friends hook
import { useFriends } from '@/hooks/use-friends';

interface CourtCardProps {
  court: Court;
  onBookingChange?: () => void; // Optional callback when booking changes (for Home screen refresh)
}

export default function CourtCard({ court, onBookingChange }: CourtCardProps) {
  const colorScheme = useColorScheme();
  const { hasRole } = useAuth();
  const { getFriendsAttendingCourt } = useFriends();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [friendsAttending, setFriendsAttending] = useState<string[]>([]); // Array of friend user IDs
  const [friendsCount, setFriendsCount] = useState(0);
  const isAdmin = hasRole('administrator');

  // Fetch friends attending this court
  useEffect(() => {
    const loadFriendsAttending = async () => {
      try {
        const friends = await getFriendsAttendingCourt(court.id);
        const friendIds = friends.map(f => f.userId);
        setFriendsAttending(friendIds);
        setFriendsCount(friends.length);
        console.log(`[CourtCard] Friends attending ${court.name}:`, friends.length, friendIds);
      } catch (error) {
        console.error('Error loading friends attending court:', error);
        setFriendsAttending([]);
        setFriendsCount(0);
      }
    };

    loadFriendsAttending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [court.id, refreshKey]); // Removed getFriendsAttendingCourt from deps to avoid infinite loops

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

  const handleDeleteCourt = () => {
    Alert.alert(
      'Delete Court',
      `Are you sure you want to delete "${court.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await courtService.deleteCourt(court.id);
              Alert.alert('Success', 'Court deleted successfully');
              onBookingChange?.(); // Notify parent to refresh
            } catch (error) {
              Alert.alert('Error', 'Failed to delete court. Please try again.');
              console.error('Error deleting court:', error);
            }
          },
        },
      ]
    );
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
        {/* Row 1: Court name + Outdoor/Indoor badge on the same line */}
        <View style={styles.headerTopRow}>
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
        {/* Row 2: Friends badge (only when friends are attending) */}
        {friendsCount > 0 ? (
          <ThemedView
            style={[
              styles.friendsBadge,
              {
                backgroundColor: colorScheme === 'dark' 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(59, 130, 246, 0.15)',
              },
            ]}>
            <IconSymbol name="person.2.fill" size={14} color="#3b82f6" />
            <ThemedText
              style={[
                styles.friendsBadgeText,
                { color: '#3b82f6' },
              ]}>
              {friendsCount} {friendsCount === 1 ? 'friend' : 'friends'}
            </ThemedText>
          </ThemedView>
        ) : null}
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

      {/* Admin: Action Buttons */}
      {isAdmin && (
        <View style={styles.adminActions}>
          {court.type === 'outdoor' && (
            <TouchableOpacity
              style={[
                styles.adminButton,
                styles.updateStatusButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? '#0a7ea4' : Colors[colorScheme ?? 'light'].tint,
                },
              ]}
              onPress={() => setIsStatusModalVisible(true)}>
              <ThemedText style={styles.adminButtonText}>Update Status</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.deleteButton,
              {
                backgroundColor: colorScheme === 'dark' ? '#dc2626' : '#ef4444',
              },
            ]}
            onPress={handleDeleteCourt}>
            <ThemedText style={styles.adminButtonText}>Delete Court</ThemedText>
          </TouchableOpacity>
        </View>
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
        <ParticipantsList 
          court={court} 
          showTitle={true}
          friendIds={friendsAttending}
        />
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
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courtName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  friendsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  friendsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
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
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  adminButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateStatusButton: {
    // Styles applied via inline style
  },
  deleteButton: {
    // Styles applied via inline style
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
