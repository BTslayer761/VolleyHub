import { Link } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

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
  const { bookings, loading, cancelOutdoorBooking, cancelIndoorBooking } = useBookings();

  const handleCancel = async (bookingId: string, courtId: string, isOutdoor: boolean) => {
    if (isOutdoor) {
      await cancelOutdoorBooking(courtId);
    } else {
      await cancelIndoorBooking(bookingId);
    }
  };

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
        <ThemedView style={styles.titleRow}>
          <ThemedText type="title">My Bookings</ThemedText>
          <HelloWave />
        </ThemedView>
        <Link href="/booking-demo" asChild>
          <TouchableOpacity style={styles.testButton} activeOpacity={0.7}>
            <ThemedText style={styles.testButtonText}>🧪 Test Components</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>

      {loading ? (
        <BookingLoadingState />
      ) : bookings.length === 0 ? (
        <BookingEmptyState />
      ) : (
        <BookingList bookings={bookings} onCancel={handleCancel} />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 12,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  testButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
