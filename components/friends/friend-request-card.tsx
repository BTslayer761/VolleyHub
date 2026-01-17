/**
 * FriendRequestCard Component
 * Displays a single friend request with accept/reject actions
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FriendRequest } from '@/shared/types/friend.types';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  isProcessing?: boolean;
}

export function FriendRequestCard({
  request,
  onAccept,
  onReject,
  isProcessing = false,
}: FriendRequestCardProps) {
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

  const handleAccept = async () => {
    if (!isProcessing) {
      await onAccept(request.id);
    }
  };

  const handleReject = async () => {
    if (!isProcessing) {
      await onReject(request.id);
    }
  };

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: borderColor,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          opacity: isProcessing ? 0.6 : 1,
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
            {request.fromUserName}
          </ThemedText>
          <ThemedText style={styles.email} numberOfLines={1}>
            {request.fromUserEmail}
          </ThemedText>
          <ThemedText style={styles.timeAgo}>
            Sent {formatTimeAgo(request.createdAt)}
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.rejectButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#dc2626' : '#ef4444',
              opacity: isProcessing ? 0.6 : 1,
            },
          ]}
          onPress={handleReject}
          disabled={isProcessing}
          activeOpacity={0.8}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol name="xmark" size={16} color="#fff" />
              <ThemedText style={styles.rejectButtonText}>Reject</ThemedText>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.acceptButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint,
              opacity: isProcessing ? 0.6 : 1,
            },
          ]}
          onPress={handleAccept}
          disabled={isProcessing}
          activeOpacity={0.8}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol name="checkmark" size={16} color="#fff" />
              <ThemedText style={styles.acceptButtonText}>Accept</ThemedText>
            </>
          )}
        </TouchableOpacity>
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
    marginBottom: 12,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
