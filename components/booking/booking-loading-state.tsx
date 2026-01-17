/**
 * BookingLoadingState Component
 * Displays a loading indicator while bookings are being fetched
 */

import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function BookingLoadingState() {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.text}>Loading bookings...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  text: {
    marginTop: 16,
    opacity: 0.6,
  },
});
