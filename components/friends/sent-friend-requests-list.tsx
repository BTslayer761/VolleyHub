/**
 * SentFriendRequestsList Component
 * Displays a list of sent friend requests
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { SentFriendRequestCard } from './sent-friend-request-card';
import { FriendRequest } from '@/shared/types/friend.types';

interface SentFriendRequestsListProps {
  requests: FriendRequest[];
  onCancel?: (requestId: string) => Promise<void>;
  processingRequestId?: string | null;
}

export function SentFriendRequestsList({ 
  requests, 
  onCancel,
  processingRequestId,
}: SentFriendRequestsListProps) {
  if (requests.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <ThemedView style={styles.container}>
      {requests.map((request) => (
        <SentFriendRequestCard 
          key={request.id} 
          request={request}
          onCancel={onCancel}
          isProcessing={processingRequestId === request.id}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0, // Gap handled by SentFriendRequestCard marginBottom
  },
});
