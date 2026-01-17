import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Court } from '@/shared/types/court.types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CourtCardProps {
  court: Court;
}

export default function CourtCard({ court }: CourtCardProps) {
  const colorScheme = useColorScheme();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: Colors[colorScheme ?? 'light'].icon + '20',
        },
      ]}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.courtName}>
          {court.name}
        </ThemedText>
        <ThemedView
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                court.type === 'outdoor'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)',
            },
          ]}>
          <ThemedText
            style={[
              styles.typeText,
              {
                color: court.type === 'outdoor' ? '#22c55e' : '#3b82f6',
              },
            ]}>
            {court.type === 'outdoor' ? 'Outdoor' : 'Indoor'}
          </ThemedText>
        </ThemedView>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Location:</ThemedText>
          <ThemedText style={styles.detailValue}>{court.location}</ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Date:</ThemedText>
          <ThemedText style={styles.detailValue}>{formatDate(court.date)}</ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Time:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {formatTime(court.startTime)} - {formatTime(court.endTime)}
          </ThemedText>
        </View>

        {court.type === 'indoor' && court.maxSlots && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Max Slots:</ThemedText>
            <ThemedText style={styles.detailValue}>{court.maxSlots} people</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
