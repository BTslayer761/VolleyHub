/**
 * BookingEmptyState Component
 * Displays when user has no bookings
 */

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function BookingEmptyState() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">No Bookings Yet</ThemedText>
      <ThemedText style={styles.text}>
        Head to the Courts tab to book a volleyball session!
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
});
