/**
 * FriendsList Component
 * Displays a list of friends using FriendCard components
 */

import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { FriendCard } from './friend-card';
import { Friend } from '@/shared/types/friend.types';

interface FriendsListProps {
  friends: Friend[];
  onFriendPress?: (friend: Friend) => void;
  showActivity?: boolean;
}

export function FriendsList({ friends, onFriendPress, showActivity = true }: FriendsListProps) {
  if (friends.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <ThemedView style={styles.container}>
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          friend={friend}
          onPress={onFriendPress}
          showActivity={showActivity}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0, // Gap handled by FriendCard marginBottom
  },
});
