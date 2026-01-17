/**
 * ParticipantsList Component
 * Displays a list of participants for a court
 * Shows who's going (outdoor) or who has slots (indoor)
 * Used in Courts tab to show participants
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Mock services (temporary - will be replaced with real services during integration)
import { mockBookingService } from '@/app/mocks/booking-mock';

// Types
import { BookingStatus, Participant } from '@/shared/types/booking.types';
import { Court } from '@/shared/types/court.types';

interface ParticipantsListProps {
  court: Court;
  showTitle?: boolean; // Whether to show "Participants" title
  onRefresh?: () => void; // Callback to refresh list
}

export function ParticipantsList({ court, showTitle = true, onRefresh }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadParticipants();
  }, [court.id]);

  // Reload when onRefresh is called
  useEffect(() => {
    if (onRefresh) {
      // This is a simple way to trigger reload when parent wants to refresh
      // In real app, you might use a ref or different pattern
    }
  }, [onRefresh]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      const participantsList = await mockBookingService.getCourtParticipants(court.id);
      
      // Sort participants: confirmed first (with slots for indoor), then pending, then waitlisted
      const sorted = participantsList.sort((a, b) => {
        // For indoor courts, sort by slot number first
        if (court.type === 'indoor') {
          if (a.slotIndex !== undefined && b.slotIndex !== undefined) {
            return a.slotIndex - b.slotIndex;
          }
          if (a.slotIndex !== undefined) return -1;
          if (b.slotIndex !== undefined) return 1;
        }
        
        // Then sort by status
        const statusOrder: BookingStatus[] = ['confirmed', 'pending', 'waitlisted'];
        const aStatus = a.status || 'pending';
        const bStatus = b.status || 'pending';
        return statusOrder.indexOf(aStatus) - statusOrder.indexOf(bStatus);
      });

      setParticipants(sorted);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load participants');
      setError(error);
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: BookingStatus): string => {
    if (!status) return '#6B7280'; // Gray
    switch (status) {
      case 'confirmed':
        return '#10B981'; // Green
      case 'pending':
        return '#F59E0B'; // Orange
      case 'waitlisted':
        return '#6366F1'; // Indigo
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status?: BookingStatus): string => {
    if (!status) return 'Going';
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'waitlisted':
        return 'Waitlisted';
      default:
        return 'Going';
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        {showTitle && (
          <ThemedText type="subtitle" style={styles.title}>
            Participants
          </ThemedText>
        )}
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <ThemedText style={styles.loadingText}>Loading participants...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        {showTitle && (
          <ThemedText type="subtitle" style={styles.title}>
            Participants
          </ThemedText>
        )}
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Failed to load participants</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (participants.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {showTitle && (
          <ThemedText type="subtitle" style={styles.title}>
            Participants
          </ThemedText>
        )}
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {court.type === 'outdoor' 
              ? 'No one is going yet. Be the first!' 
              : 'No slot requests yet.'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const isIndoor = court.type === 'indoor';

  return (
    <ThemedView style={styles.container}>
      {showTitle && (
        <ThemedText type="subtitle" style={styles.title}>
          Participants ({participants.length})
        </ThemedText>
      )}
      
      <ThemedView style={styles.list}>
        {participants.map((participant, index) => {
          const statusColor = getStatusColor(participant.status);
          const statusText = getStatusText(participant.status);

          return (
            <ThemedView key={participant.userId} style={styles.participantItem}>
              <ThemedView style={styles.participantInfo}>
                <ThemedText type="defaultSemiBold" style={styles.participantName}>
                  {participant.userName}
                </ThemedText>
                {isIndoor && participant.slotIndex !== undefined && (
                  <ThemedText style={styles.slotText}>Slot {participant.slotIndex}</ThemedText>
                )}
              </ThemedView>
              
              <ThemedView
                style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>
                  {statusText}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  title: {
    marginBottom: 4,
  },
  list: {
    gap: 8,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  participantInfo: {
    flex: 1,
    gap: 4,
  },
  participantName: {
    fontSize: 16,
  },
  slotText: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.6,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    opacity: 0.8,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
