/**
 * SentFriendRequestCard Component
 * Displays a sent friend request (one you sent to someone else)
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FriendRequest } from '@/shared/types/friend.types';

interface SentFriendRequestCardProps {
  request: FriendRequest;
  onCancel?: (requestId: string) => Promise<void>;
  isProcessing?: boolean;
}

export function SentFriendRequestCard({ 
  request, 
  onCancel,
  isProcessing = false,
}: SentFriendRequestCardProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#444' : '#ddd';

  const handleCancel = async () => {
    if (!onCancel) return;
    
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel the friend request to ${request.toUserName || 'this user'}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await onCancel(request.id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel request. Please try again.');
            }
          },
        },
      ]
    );
  };

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
            {request.toUserName || 'User'}
          </ThemedText>
          <ThemedText style={styles.email} numberOfLines={1}>
            {request.toUserEmail || request.toUserId}
          </ThemedText>
          <ThemedText style={styles.timeAgo}>
            Sent {formatTimeAgo(request.createdAt)}
          </ThemedText>
        </View>

        {/* Cancel Button */}
        {onCancel && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: colorScheme === 'dark' ? '#dc2626' : '#ef4444',
                opacity: isProcessing ? 0.6 : 1,
              },
            ]}
            onPress={handleCancel}
            disabled={isProcessing}
            activeOpacity={0.8}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <IconSymbol name="xmark" size={16} color="#fff" />
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </>
            )}
          </TouchableOpacity>
        )}
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
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
