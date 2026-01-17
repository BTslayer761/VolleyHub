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
}

export function SentFriendRequestsList({ requests }: SentFriendRequestsListProps) {
  if (requests.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <ThemedView style={styles.container}>
      {requests.map((request) => (
        <SentFriendRequestCard key={request.id} request={request} />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0, // Gap handled by SentFriendRequestCard marginBottom
  },
});
