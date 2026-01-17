/**
 * FriendRequestsList Component
 * Displays a list of friend requests using FriendRequestCard components
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { FriendRequestCard } from './friend-request-card';
import { FriendRequest } from '@/shared/types/friend.types';

interface FriendRequestsListProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  processingRequestId?: string | null;
}

export function FriendRequestsList({
  requests,
  onAccept,
  onReject,
  processingRequestId,
}: FriendRequestsListProps) {
  if (requests.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <ThemedView style={styles.container}>
      {requests.map((request) => (
        <FriendRequestCard
          key={request.id}
          request={request}
          onAccept={onAccept}
          onReject={onReject}
          isProcessing={processingRequestId === request.id}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0, // Gap handled by FriendRequestCard marginBottom
  },
});
