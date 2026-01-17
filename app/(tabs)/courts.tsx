import CourtCard from '@/components/court-card';
import CourtPostingModal from '@/components/court-posting-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { courtService } from '@/lib/services/court-service';
import { Court, CourtType } from '@/shared/types/court.types';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function CourtsScreen() {
  const colorScheme = useColorScheme();
  const { hasRole } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [filterType, setFilterType] = useState<CourtType | 'all'>('all');
  const [isPostingModalVisible, setIsPostingModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh of CourtCard components
  const isAdmin = hasRole('administrator');
  const loadCourtsRef = useRef<() => Promise<void>>();

  // Keep loadCourts ref up to date
  const loadCourts = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = filterType !== 'all' ? { type: filterType } : undefined;
      const fetchedCourts = await courtService.getCourts(filters);
      setCourts(fetchedCourts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load courts');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  loadCourtsRef.current = loadCourts;

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  // Refresh courts and participants when screen comes into focus
  // This ensures booking changes from home page are reflected here
  useFocusEffect(
    useCallback(() => {
      // Refresh courts list and force CourtCard components to refresh participants
      if (loadCourtsRef.current) {
        loadCourtsRef.current();
      }
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const handleCourtCreated = () => {
    setIsPostingModalVisible(false);
    loadCourts(); // Reload courts after posting
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Courts
          </ThemedText>
          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.postButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? '#0a7ea4' : Colors[colorScheme ?? 'light'].tint,
                },
              ]}
              onPress={() => setIsPostingModalVisible(true)}>
              <IconSymbol name="plus" size={20} color="#fff" />
              <ThemedText style={styles.postButtonText}>Post Court</ThemedText>
            </TouchableOpacity>
          )}
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

        {/* Courts List */}
        {isLoading ? (
          <ThemedView style={styles.centerContainer}>
            <ThemedText>Loading courts...</ThemedText>
          </ThemedView>
        ) : courts.length === 0 ? (
          <ThemedView style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>No courts available</ThemedText>
            {isAdmin && (
              <ThemedText style={styles.emptySubtext}>
                Tap "Post Court" to create one
              </ThemedText>
            )}
          </ThemedView>
        ) : (
          <ThemedView style={styles.courtsList}>
            {courts.map((court) => (
              <CourtCard key={`${court.id}-${refreshKey}`} court={court} />
            ))}
          </ThemedView>
        )}
      </ScrollView>

      {/* Posting Modal */}
      {isAdmin && (
        <CourtPostingModal
          visible={isPostingModalVisible}
          onClose={() => setIsPostingModalVisible(false)}
          onCourtCreated={handleCourtCreated}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
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
  courtsList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});
