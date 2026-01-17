/**
 * Booking utility functions
 * Helper functions for formatting and status handling
 */

import { Booking } from '@/shared/types/booking.types';
import { Court } from '@/shared/types/court.types';

/**
 * Format a date to a readable string
 */
export function formatBookingDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get the color code for a booking status
 */
export function getBookingStatusColor(status?: string, isGoing?: boolean): string {
  if (isGoing) return '#10B981'; // Green for outdoor "going"
  if (status === 'confirmed') return '#10B981'; // Green
  if (status === 'pending') return '#F59E0B'; // Yellow/Orange
  if (status === 'waitlisted') return '#6366F1'; // Indigo
  return '#6B7280'; // Gray
}

/**
 * Get the display text for a booking status
 */
export function getBookingStatusText(booking: Booking, court: Court | null): string {
  if (booking.isGoing) return 'Going';
  if (booking.status === 'confirmed') return `Slot ${booking.slotIndex || ''} - Confirmed`;
  if (booking.status === 'pending') return 'Pending Assignment';
  if (booking.status === 'waitlisted') return 'Waitlisted';
  return 'Booked';
}

/**
 * Combined booking data with court information
 */
export interface BookingWithCourt {
  booking: Booking;
  court: Court | null;
}
