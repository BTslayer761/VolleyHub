/**
 * OutdoorBookingButton Component
 * Toggle button for outdoor court RSVP (Going / Not Going)
 * Used in Courts tab to allow users to join/leave outdoor court sessions
 */

import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Services
import { useAuth } from '@/contexts/AuthContext';
import { mockBookingService } from '@/app/mocks/booking-mock';

// Types
import { Court } from '@/shared/types/court.types';

interface OutdoorBookingButtonProps {
  court: Court;
  onBookingChange?: () => void; // Callback when booking status changes
}

export function OutdoorBookingButton({ court, onBookingChange }: OutdoorBookingButtonProps) {
  const { user } = useAuth();
  const [isGoing, setIsGoing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check initial booking status
  useEffect(() => {
    checkBookingStatus();
  }, [court.id, user?.id]);

  const checkBookingStatus = async () => {
    try {
      setIsChecking(true);
      if (!user) {
        setIsChecking(false);
        return;
      }

      const booking = await mockBookingService.getBookingStatus(court.id, user.id);
      setIsGoing(booking?.isGoing ?? false);
    } catch (error) {
      console.error('Error checking booking status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggle = async () => {
    if (!user) {
      return;
    }

    // If user is already going, show confirmation before canceling
    if (isGoing) {
      Alert.alert(
        'Cancel Booking',
        `Are you sure you want to cancel your booking for ${court.name}?`,
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => {
              // User cancelled, do nothing
            },
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await mockBookingService.cancelOutdoorBooking(court.id, user.id);
                setIsGoing(false);
                // Notify parent component of change
                onBookingChange?.();
              } catch (error) {
                console.error('Error canceling booking:', error);
                Alert.alert('Error', 'Failed to cancel booking. Please try again.');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Create booking without confirmation
      try {
        setIsLoading(true);
        await mockBookingService.createOutdoorBooking(court.id, user.id);
        setIsGoing(true);
        // Notify parent component of change
        onBookingChange?.();
      } catch (error) {
        console.error('Error creating booking:', error);
        Alert.alert('Error', 'Failed to create booking. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Show loading state while checking initial status
  if (isChecking) {
    return (
      <TouchableOpacity style={[styles.button, styles.buttonDisabled]} disabled>
        <ThemedText style={styles.buttonText}>Loading...</ThemedText>
      </TouchableOpacity>
    );
  }

  // Show button with current state
  return (
    <TouchableOpacity
      style={[styles.button, isGoing ? styles.buttonGoing : styles.buttonJoin]}
      onPress={handleToggle}
      disabled={isLoading}
      activeOpacity={0.7}>
      <ThemedText style={[styles.buttonText, isGoing ? styles.buttonTextGoing : styles.buttonTextJoin]}>
        {isLoading ? 'Processing...' : isGoing ? '✓ Going' : 'Join Session'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch', // Make button full width like home screen
  },
  buttonJoin: {
    backgroundColor: '#10B981', // Green
    borderWidth: 1,
    borderColor: '#059669',
  },
  buttonGoing: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green background
    borderWidth: 1,
    borderColor: '#10B981', // Green border
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF', // Gray
    borderColor: '#6B7280',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextJoin: {
    color: '#FFFFFF', // White text for green button
  },
  buttonTextGoing: {
    color: '#10B981', // Green text
  },
});
