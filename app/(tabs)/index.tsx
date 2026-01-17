import { Image, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Booking components
import { BookingEmptyState } from '@/components/booking/booking-empty-state';
import { BookingList } from '@/components/booking/booking-list';
import { BookingLoadingState } from '@/components/booking/booking-loading-state';

// Custom hook for fetching bookings
import { useBookings } from '@/hooks/use-bookings';

export default function HomeScreen() {
  const { bookings, loading } = useBookings();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Bookings</ThemedText>
        <HelloWave />
      </ThemedView>

      {loading ? (
        <BookingLoadingState />
      ) : bookings.length === 0 ? (
        <BookingEmptyState />
      ) : (
        <BookingList bookings={bookings} />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
