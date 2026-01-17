/**
 * Booking Components Demo Screen
 * 
 * This is a test/demo screen to verify all booking components work together.
 * It demonstrates:
 * - OutdoorBookingButton with ParticipantsList
 * - IndoorBookingButton with ParticipantsList
 * - Component interactions and refreshes
 * 
 * Access via: /booking-demo
 */

import { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Booking components
import { IndoorBookingButton } from '@/components/booking/indoor-booking-button';
import { OutdoorBookingButton } from '@/components/booking/outdoor-booking-button';
import { ParticipantsList } from '@/components/booking/participants-list';

// Mock services
import { mockCourtService } from '@/app/mocks/court-mock';

// Types
import { Court } from '@/shared/types/court.types';

export default function BookingDemoScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Get sample courts for demo
  const [outdoorCourt, setOutdoorCourt] = useState<Court | null>(null);
  const [indoorCourt, setIndoorCourt] = useState<Court | null>(null);

  useEffect(() => {
    // Load demo courts
    const loadCourts = async () => {
      const courts = await mockCourtService.getCourts();
      const outdoor = courts.find((c) => c.type === 'outdoor');
      const indoor = courts.find((c) => c.type === 'indoor');
      setOutdoorCourt(outdoor || null);
      setIndoorCourt(indoor || null);
    };
    loadCourts();
  }, []);

  // Refresh participants list when booking changes
  const handleBookingChange = () => {
    // Force re-render by updating refresh key
    // This will cause ParticipantsList to reload
    setRefreshKey((prev) => prev + 1);
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
        <ThemedText type="title">Booking Components Demo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test all booking components together
        </ThemedText>
      </ThemedView>

      {/* Outdoor Court Demo */}
      {outdoorCourt && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Outdoor Court Demo
          </ThemedText>
          
          <ThemedView style={styles.courtCard}>
            <ThemedView style={styles.courtHeader}>
              <ThemedView style={styles.courtInfo}>
                <ThemedText type="defaultSemiBold" style={styles.courtName}>
                  {outdoorCourt.name}
                </ThemedText>
                <ThemedText style={styles.courtLocation}>{outdoorCourt.location}</ThemedText>
                <ThemedText style={styles.courtTime}>
                  📅 {outdoorCourt.date.toLocaleDateString()} • 🕐 {outdoorCourt.startTime} - {outdoorCourt.endTime}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
              <OutdoorBookingButton 
                court={outdoorCourt} 
                onBookingChange={handleBookingChange}
              />
            </ThemedView>

            <ThemedView style={styles.participantsContainer} key={`outdoor-${refreshKey}`}>
              <ParticipantsList 
                court={outdoorCourt} 
                showTitle={true}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {/* Indoor Court Demo */}
      {indoorCourt && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Indoor Court Demo
          </ThemedText>
          
          <ThemedView style={styles.courtCard}>
            <ThemedView style={styles.courtHeader}>
              <ThemedView style={styles.courtInfo}>
                <ThemedText type="defaultSemiBold" style={styles.courtName}>
                  {indoorCourt.name}
                </ThemedText>
                <ThemedText style={styles.courtLocation}>{indoorCourt.location}</ThemedText>
                <ThemedText style={styles.courtTime}>
                  📅 {indoorCourt.date.toLocaleDateString()} • 🕐 {indoorCourt.startTime} - {indoorCourt.endTime}
                </ThemedText>
                {indoorCourt.maxSlots && (
                  <ThemedText style={styles.courtSlots}>
                    🎯 Max Slots: {indoorCourt.maxSlots} • Mode: {indoorCourt.bookingMode || 'N/A'}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
              <IndoorBookingButton 
                court={indoorCourt} 
                onBookingChange={handleBookingChange}
              />
            </ThemedView>

            <ThemedView style={styles.participantsContainer} key={`indoor-${refreshKey}`}>
              <ParticipantsList 
                court={indoorCourt} 
                showTitle={true}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {/* Instructions */}
      <ThemedView style={styles.instructionsSection}>
        <ThemedText type="subtitle" style={styles.instructionsTitle}>
          Testing Instructions
        </ThemedText>
        <ThemedView style={styles.instructionsList}>
          <ThemedText style={styles.instructionItem}>
            ✅ Tap "Join Session" (Outdoor) to create a booking
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            ✅ Tap "Request Slot" (Indoor) to request a slot
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            ✅ Check ParticipantsList updates after booking
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            ✅ Tap button again to cancel booking
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            ✅ Verify status badges change correctly
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  section: {
    gap: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  courtCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  courtHeader: {
    gap: 8,
  },
  courtInfo: {
    gap: 6,
  },
  courtName: {
    fontSize: 20,
  },
  courtLocation: {
    fontSize: 14,
    opacity: 0.7,
  },
  courtTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  courtSlots: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  buttonContainer: {
    alignItems: 'flex-start',
  },
  participantsContainer: {
    marginTop: 8,
  },
  instructionsSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  instructionsTitle: {
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
