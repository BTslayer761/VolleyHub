/**
 * FriendsEmptyState Component
 * Shown when user has no friends yet
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function FriendsEmptyState() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: themeColors.tint + '20',
          },
        ]}>
        <IconSymbol
          name="person.2.fill"
          size={64}
          color={themeColors.tint}
        />
      </View>
      <ThemedText type="title" style={styles.title}>
        No Friends Yet
      </ThemedText>
      <ThemedText style={styles.description}>
        Start building your volleyball network! Add friends to see their activity and book sessions together.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 300,
  },
});
