/**
 * SentFriendRequestCard Component
 * Displays a sent friend request (one you sent to someone else)
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FriendRequest } from '@/shared/types/friend.types';

interface SentFriendRequestCardProps {
  request: FriendRequest;
}

export function SentFriendRequestCard({ request }: SentFriendRequestCardProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#444' : '#ddd';

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: borderColor,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
        },
      ]}>
      <View style={styles.content}>
        {/* Avatar/Icon */}
        <ThemedView
          style={[
            styles.avatar,
            {
              backgroundColor: themeColors.tint + '20',
            },
          ]}>
          <IconSymbol
            name="person.fill"
            size={32}
            color={themeColors.tint}
          />
        </ThemedView>

        {/* Request Info */}
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            Waiting for response
          </ThemedText>
          <ThemedText style={styles.email} numberOfLines={1}>
            Request sent to user
          </ThemedText>
          <ThemedText style={styles.timeAgo}>
            Sent {formatTimeAgo(request.createdAt)}
          </ThemedText>
        </View>

        {/* Status Badge */}
        <ThemedView
          style={[
            styles.statusBadge,
            {
              backgroundColor: '#F59E0B20', // Orange background
            },
          ]}>
          <IconSymbol name="clock.fill" size={16} color="#F59E0B" />
          <ThemedText style={[styles.statusText, { color: '#F59E0B' }]}>
            Pending
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  timeAgo: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
