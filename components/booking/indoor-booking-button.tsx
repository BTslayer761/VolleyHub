/**
 * IndoorBookingButton Component
 * Button for requesting/canceling indoor court slot bookings
 * Used in Courts tab to allow users to request slots for indoor courts
 * Handles different booking statuses: pending, confirmed, waitlisted
 */

import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Mock services (temporary - will be replaced with real services during integration)
import { mockAuthService } from '@/app/mocks/auth-mock';
import { mockBookingService } from '@/app/mocks/booking-mock';

// Types
import { BookingStatus } from '@/shared/types/booking.types';
import { Court } from '@/shared/types/court.types';

interface IndoorBookingButtonProps {
  court: Court;
  onBookingChange?: () => void; // Callback when booking status changes
}

export function IndoorBookingButton({ court, onBookingChange }: IndoorBookingButtonProps) {
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [slotIndex, setSlotIndex] = useState<number | undefined>(undefined);
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
      
      if (booking) {
        setBookingStatus(booking.status || 'pending');
        setBookingId(booking.id);
        setSlotIndex(booking.slotIndex);
      } else {
        setBookingStatus(null);
        setBookingId(null);
        setSlotIndex(undefined);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequest = async () => {
    try {
      setIsLoading(true);
      const user = mockAuthService.getCurrentUser();
      if (!user) {
        return;
      }

      // If already booked, cancel it
      if (bookingId) {
        await mockBookingService.cancelIndoorBooking(bookingId);
        setBookingStatus(null);
        setBookingId(null);
        setSlotIndex(undefined);
      } else {
        // Request a new slot
        const booking = await mockBookingService.requestIndoorSlot(court.id, user.id);
        setBookingStatus(booking.status || 'pending');
        setBookingId(booking.id);
        setSlotIndex(booking.slotIndex);
      }

      // Notify parent component of change
      onBookingChange?.();
    } catch (error) {
      console.error('Error requesting/canceling booking:', error);
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

  // Determine button text and style based on status
  const getButtonConfig = () => {
    if (!bookingStatus) {
      return {
        text: 'Request Slot',
        style: styles.buttonRequest,
        textStyle: styles.buttonTextRequest,
      };
    }

    switch (bookingStatus) {
      case 'confirmed':
        return {
          text: slotIndex !== undefined ? `✓ Slot ${slotIndex}` : '✓ Confirmed',
          style: styles.buttonConfirmed,
          textStyle: styles.buttonTextConfirmed,
        };
      case 'pending':
        return {
          text: 'Pending...',
          style: styles.buttonPending,
          textStyle: styles.buttonTextPending,
        };
      case 'waitlisted':
        return {
          text: 'Waitlisted',
          style: styles.buttonWaitlisted,
          textStyle: styles.buttonTextWaitlisted,
        };
      default:
        return {
          text: 'Request Slot',
          style: styles.buttonRequest,
          textStyle: styles.buttonTextRequest,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <TouchableOpacity
      style={[styles.button, buttonConfig.style]}
      onPress={handleRequest}
      disabled={isLoading}
      activeOpacity={0.7}>
      <ThemedText style={[styles.buttonText, buttonConfig.textStyle]}>
        {isLoading ? 'Processing...' : bookingStatus ? `${buttonConfig.text} (Cancel)` : buttonConfig.text}
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
  buttonRequest: {
    backgroundColor: '#3B82F6', // Blue
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  buttonConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green background
    borderWidth: 1,
    borderColor: '#10B981', // Green border
  },
  buttonPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Light orange background
    borderWidth: 1,
    borderColor: '#F59E0B', // Orange border
  },
  buttonWaitlisted: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light indigo background
    borderWidth: 1,
    borderColor: '#6366F1', // Indigo border
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
  buttonTextRequest: {
    color: '#FFFFFF', // White text for blue button
  },
  buttonTextConfirmed: {
    color: '#10B981', // Green text
  },
  buttonTextPending: {
    color: '#F59E0B', // Orange text
  },
  buttonTextWaitlisted: {
    color: '#6366F1', // Indigo text
  },
});
