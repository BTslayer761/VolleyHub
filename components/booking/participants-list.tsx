/**
 * ParticipantsList Component
 * Displays a list of participants for a court
 * Shows who's going (outdoor) or who has slots (indoor)
 * Used in Courts tab to show participants
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
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
  const [movingParticipant, setMovingParticipant] = useState<string | null>(null);

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

  const handleMoveParticipant = async (userId: string, direction: 'up' | 'down') => {
    if (movingParticipant) return; // Prevent concurrent moves
    
    const participant = participants.find((p) => p.userId === userId);
    if (!participant || participant.slotIndex === undefined) return;

    const currentIndex = participant.slotIndex;
    const newSlotIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Validate bounds
    if (newSlotIndex < 1) return; // Can't move above slot 1
    const maxSlot = Math.max(...participants.map((p) => p.slotIndex || 0));
    if (newSlotIndex > maxSlot) return; // Can't move below last slot

    try {
      setMovingParticipant(userId);
      await mockBookingService.moveParticipant(court.id, userId, newSlotIndex);
      await loadParticipants(); // Reload to reflect changes
      onRefresh?.(); // Notify parent to refresh
    } catch (err) {
      Alert.alert('Error', 'Failed to move participant. Please try again.');
      console.error('Error moving participant:', err);
    } finally {
      setMovingParticipant(null);
    }
  };

  const canMoveUp = (participant: Participant): boolean => {
    if (!participant.slotIndex) return false;
    return participant.slotIndex > 1;
  };

  const canMoveDown = (participant: Participant): boolean => {
    if (!participant.slotIndex) return false;
    const maxSlot = Math.max(...participants.map((p) => p.slotIndex || 0));
    return participant.slotIndex < maxSlot;
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
            const isMoving = movingParticipant === participant.userId;
            const showMoveControls = isIndoor && isAdmin && participant.slotIndex !== undefined;

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
                
                <ThemedView style={styles.rightSection}>
                  <ThemedView
                    style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: statusColor }]}>
                      {statusText}
                    </ThemedText>
                  </ThemedView>

                  {/* Admin Move Controls (Indoor courts only) */}
                  {showMoveControls && (
                    <ThemedView style={styles.moveControls}>
                      <TouchableOpacity
                        style={[
                          styles.moveButton,
                          !canMoveUp(participant) && styles.moveButtonDisabled,
                          { borderColor: Colors[colorScheme ?? 'light'].tint },
                        ]}
                        onPress={() => handleMoveParticipant(participant.userId, 'up')}
                        disabled={!canMoveUp(participant) || isMoving}
                        activeOpacity={0.7}>
                        <IconSymbol
                          name="chevron.up"
                          size={16}
                          color={
                            canMoveUp(participant) && !isMoving
                              ? Colors[colorScheme ?? 'light'].tint
                              : '#9CA3AF'
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.moveButton,
                          !canMoveDown(participant) && styles.moveButtonDisabled,
                          { borderColor: Colors[colorScheme ?? 'light'].tint },
                        ]}
                        onPress={() => handleMoveParticipant(participant.userId, 'down')}
                        disabled={!canMoveDown(participant) || isMoving}
                        activeOpacity={0.7}>
                        <IconSymbol
                          name="chevron.down"
                          size={16}
                          color={
                            canMoveDown(participant) && !isMoving
                              ? Colors[colorScheme ?? 'light'].tint
                              : '#9CA3AF'
                          }
                        />
                      </TouchableOpacity>
                    </ThemedView>
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
  moveControls: {
    flexDirection: 'row',
    gap: 4,
  },
  moveButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  moveButtonDisabled: {
    opacity: 0.4,
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
