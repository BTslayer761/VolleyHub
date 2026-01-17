/**
 * FriendCard Component
 * Displays a single friend with their info and activity status
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Friend } from '@/shared/types/friend.types';

interface FriendCardProps {
  friend: Friend;
  onPress?: (friend: Friend) => void;
  showActivity?: boolean; // Show if friend is online/active
}

export function FriendCard({ friend, onPress, showActivity = true }: FriendCardProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#444' : '#ddd';

  const handlePress = () => {
    onPress?.(friend);
  };

  const formatLastActive = (date?: Date) => {
    if (!date) return 'Never';
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
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderColor: borderColor,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}>
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

        {/* Friend Info */}
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            {friend.name}
          </ThemedText>
          <ThemedText style={styles.email} numberOfLines={1}>
            {friend.email}
          </ThemedText>
          {showActivity && (
            <View style={styles.activityRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: friend.isOnline ? '#22c55e' : '#9ca3af',
                  },
                ]}
              />
              <ThemedText style={styles.activityText}>
                {friend.isOnline
                  ? 'Online'
                  : `Last active: ${formatLastActive(friend.lastActive)}`}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Action Icon */}
        <IconSymbol
          name="chevron.right"
          size={20}
          color={themeColors.icon}
        />
      </View>
    </TouchableOpacity>
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
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
