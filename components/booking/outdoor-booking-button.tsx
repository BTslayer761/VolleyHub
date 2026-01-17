/**
 * OutdoorBookingButton Component
 * Toggle button for outdoor court RSVP (Going / Not Going)
 * Used in Courts tab to allow users to join/leave outdoor court sessions
 */

import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Mock services (temporary - will be replaced with real services during integration)
import { mockAuthService } from '@/app/mocks/auth-mock';
import { mockBookingService } from '@/app/mocks/booking-mock';

// Types
import { Court } from '@/shared/types/court.types';

interface OutdoorBookingButtonProps {
  court: Court;
  onBookingChange?: () => void; // Callback when booking status changes
}

export function OutdoorBookingButton({ court, onBookingChange }: OutdoorBookingButtonProps) {
  const [isGoing, setIsGoing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check initial booking status
  useEffect(() => {
    checkBookingStatus();
  }, [court.id]);

  const checkBookingStatus = async () => {
    try {
      setIsChecking(true);
      const user = mockAuthService.getCurrentUser();
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
    try {
      setIsLoading(true);
      const user = mockAuthService.getCurrentUser();
      if (!user) {
        return;
      }

      if (isGoing) {
        // Cancel booking
        await mockBookingService.cancelOutdoorBooking(court.id, user.id);
        setIsGoing(false);
      } else {
        // Create booking
        await mockBookingService.createOutdoorBooking(court.id, user.id);
        setIsGoing(true);
      }

      // Notify parent component of change
      onBookingChange?.();
    } catch (error) {
      console.error('Error toggling booking:', error);
    } finally {
      setIsLoading(false);
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonJoin: {
    backgroundColor: '#10B981', // Green
    borderWidth: 1,
    borderColor: '#059669',
  },
  buttonGoing: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Light red background
    borderWidth: 1,
    borderColor: '#EF4444', // Red border
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF', // Gray
    borderColor: '#6B7280',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextJoin: {
    color: '#FFFFFF', // White text for green button
  },
  buttonTextGoing: {
    color: '#EF4444', // Red text
  },
});
