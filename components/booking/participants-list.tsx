/**
 * ParticipantsList Component
 * Displays a list of participants for a court
 * Shows who's going (outdoor) or who has slots (indoor)
 * Used in Courts tab to show participants
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock services (temporary - will be replaced with real services during integration)
import { mockBookingService } from '@/lib/mocks/booking-mock';

// Types
import { BookingStatus, Participant } from '@/shared/types/booking.types';
import { Court } from '@/shared/types/court.types';

interface ParticipantsListProps {
  court: Court;
  showTitle?: boolean; // Whether to show "Participants" title
  onRefresh?: () => void; // Callback to refresh list
}

export function ParticipantsList({ court, showTitle = true, onRefresh }: ParticipantsListProps) {
  const { hasRole } = useAuth();
  const colorScheme = useColorScheme();
  const isAdmin = hasRole('administrator');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState<string | null>(null);

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
      // Within each status group, sort by appropriate order (slotIndex for confirmed, waitlistPosition for waitlisted)
      const sorted = participantsList.sort((a, b) => {
        const statusOrder: BookingStatus[] = ['confirmed', 'pending', 'waitlisted'];
        const aStatus = a.status || 'pending';
        const bStatus = b.status || 'pending';
        const statusDiff = statusOrder.indexOf(aStatus) - statusOrder.indexOf(bStatus);
        
        // If different statuses, sort by status order
        if (statusDiff !== 0) {
          return statusDiff;
        }
        
        // Same status - sort within status group
        if (aStatus === 'confirmed' && court.type === 'indoor') {
          // Sort confirmed indoor by slotIndex (FCFS order)
          const aSlot = a.slotIndex ?? Infinity;
          const bSlot = b.slotIndex ?? Infinity;
          return aSlot - bSlot;
        } else if (aStatus === 'confirmed' && court.type === 'outdoor') {
          // For outdoor courts, participants are already sorted by createdAt in getCourtParticipants
          // Keep stable order (FCFS - first joined appears first)
          return 0;
        } else if (aStatus === 'waitlisted') {
          // Sort waitlisted by waitlistPosition (FCFS order - lower position = joined earlier)
          const aPos = a.waitlistPosition ?? Infinity;
          const bPos = b.waitlistPosition ?? Infinity;
          return aPos - bPos;
        }
        
        // Same status but no specific sort (pending, etc.)
        // Keep stable order from getCourtParticipants (already sorted by createdAt)
        return 0;
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

  const handleDeleteParticipant = async (participant: Participant) => {
    if (!participant.bookingId) {
      Alert.alert('Error', 'Cannot delete participant: booking ID not found.');
      return;
    }

    Alert.alert(
      'Delete Participant',
      `Are you sure you want to remove ${participant.userName} from this court?`,
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
              setDeletingParticipant(participant.userId);
              await mockBookingService.cancelIndoorBooking(
                participant.bookingId!,
                court.id,
                court.maxSlots
              );
              await loadParticipants(); // Reload to reflect changes
              onRefresh?.(); // Notify parent to refresh
            } catch (err) {
              Alert.alert('Error', 'Failed to delete participant. Please try again.');
              console.error('Error deleting participant:', err);
            } finally {
              setDeletingParticipant(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Collapsible title="Participants">
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <ThemedText style={styles.loadingText}>Loading participants...</ThemedText>
          </ThemedView>
        </Collapsible>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Collapsible title="Participants">
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Failed to load participants</ThemedText>
          </ThemedView>
        </Collapsible>
      </ThemedView>
    );
  }

  if (participants.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Collapsible title="Participants (0)">
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {court.type === 'outdoor' 
                ? 'No one is going yet. Be the first!' 
                : 'No slot requests yet.'}
            </ThemedText>
          </ThemedView>
        </Collapsible>
      </ThemedView>
    );
  }

  const isIndoor = court.type === 'indoor';

  const participantsTitle = `Participants (${participants.length})`;

  return (
    <ThemedView style={styles.container}>
      <Collapsible title={participantsTitle}>
        <ThemedView style={styles.list}>
          {participants.map((participant, index) => {
            const statusColor = getStatusColor(participant.status);
            const statusText = getStatusText(participant.status);
            const isDeleting = deletingParticipant === participant.userId;
            const showDeleteButton = isIndoor && isAdmin;

            return (
              <ThemedView key={participant.userId} style={styles.participantItem}>
                <ThemedView style={styles.participantInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.participantName}>
                    {participant.userName}
                  </ThemedText>
                  {isIndoor && participant.slotIndex !== undefined && (
                    <ThemedText style={styles.slotText}>Slot {participant.slotIndex + 1}</ThemedText>
                  )}
                  {isIndoor && participant.status === 'waitlisted' && participant.waitlistPosition !== undefined && (
                    <ThemedText style={styles.waitlistText}>Waitlist #{participant.waitlistPosition}</ThemedText>
                  )}
                </ThemedView>
                
                <ThemedView style={styles.rightSection}>
                  <ThemedView
                    style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: statusColor }]}>
                      {statusText}
                    </ThemedText>
                  </ThemedView>

                  {/* Admin Delete Button (Indoor courts only) */}
                  {showDeleteButton && (
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        { backgroundColor: '#dc2626' }, // Red error color
                        isDeleting && styles.deleteButtonDisabled,
                      ]}
                      onPress={() => handleDeleteParticipant(participant)}
                      disabled={isDeleting}
                      activeOpacity={0.7}>
                      <IconSymbol
                        name="trash"
                        size={18}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  )}
                </ThemedView>
              </ThemedView>
            );
          })}
        </ThemedView>
      </Collapsible>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  list: {
    gap: 8,
    marginTop: 6,
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
  waitlistText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
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
