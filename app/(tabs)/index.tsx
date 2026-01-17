import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CourtType } from '@/shared/types/court.types';

// Booking components
import { BookingEmptyState } from '@/components/booking/booking-empty-state';
import { BookingList } from '@/components/booking/booking-list';
import { BookingLoadingState } from '@/components/booking/booking-loading-state';

// Custom hook for fetching bookings
import { useBookings } from '@/hooks/use-bookings';

export default function HomeScreen() {
  const { bookings, loading, refetch } = useBookings();
  const refetchRef = useRef(refetch);
  const colorScheme = useColorScheme();
  const [filterType, setFilterType] = useState<CourtType | 'all'>('all');
  
  // Keep refetch ref up to date
  refetchRef.current = refetch;

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    if (filterType === 'all') {
      return bookings;
    }
    return bookings.filter((bookingWithCourt) => {
      return bookingWithCourt.court?.type === filterType;
    });
  }, [bookings, filterType]);

  // Refresh bookings when screen comes into focus (e.g., returning from Courts tab)
  useFocusEffect(
    useCallback(() => {
      // Use ref to avoid dependency issues
      refetchRef.current();
    }, []) // Empty deps - only refetch when screen comes into focus
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/Homepage-background.png')}
          style={styles.headerImage}
          contentFit="cover"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Bookings</ThemedText>
      </ThemedView>

      {/* Filters */}
      <ThemedView style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'all' && styles.filterButtonActive,
            { borderColor: Colors[colorScheme ?? 'light'].tint },
          ]}
          onPress={() => setFilterType('all')}>
          <ThemedText
            style={[
              styles.filterButtonText,
              filterType === 'all' && styles.filterButtonTextActive,
            ]}>
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'outdoor' && styles.filterButtonActive,
            { borderColor: Colors[colorScheme ?? 'light'].tint },
          ]}
          onPress={() => setFilterType('outdoor')}>
          <ThemedText
            style={[
              styles.filterButtonText,
              filterType === 'outdoor' && styles.filterButtonTextActive,
            ]}>
            Outdoor
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'indoor' && styles.filterButtonActive,
            { borderColor: Colors[colorScheme ?? 'light'].tint },
          ]}
          onPress={() => setFilterType('indoor')}>
          <ThemedText
            style={[
              styles.filterButtonText,
              filterType === 'indoor' && styles.filterButtonTextActive,
            ]}>
            Indoor
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <BookingLoadingState />
      ) : filteredBookings.length === 0 ? (
        <BookingEmptyState />
      ) : (
        <BookingList bookings={filteredBookings} onRefresh={refetch} />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    fontWeight: '700',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
});
