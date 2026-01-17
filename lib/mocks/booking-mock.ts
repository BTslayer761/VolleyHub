/**
 * Booking Service with Firestore Integration
 * 
 * This service now uses Firestore for persistent storage.
 * All bookings are stored in the 'bookings' collection in Firestore.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { BookingService, Booking, Participant, BookingStatus } from '@/shared/types/booking.types';

// Helper function to convert Firestore document to Booking object
function firestoreDocToBooking(docData: any, id: string): Booking {
  // Safely convert createdAt
  let createdAt: Date;
  if (docData.createdAt) {
    if (docData.createdAt.toDate && typeof docData.createdAt.toDate === 'function') {
      createdAt = docData.createdAt.toDate();
    } else if (docData.createdAt instanceof Date) {
      createdAt = docData.createdAt;
    } else if (typeof docData.createdAt === 'number') {
      createdAt = new Date(docData.createdAt);
    } else if (typeof docData.createdAt === 'string') {
      createdAt = new Date(docData.createdAt);
    } else {
      createdAt = new Date();
    }
  } else {
    createdAt = new Date();
  }

  // Safely convert updatedAt
  let updatedAt: Date | undefined;
  if (docData.updatedAt) {
    if (docData.updatedAt.toDate && typeof docData.updatedAt.toDate === 'function') {
      updatedAt = docData.updatedAt.toDate();
    } else if (docData.updatedAt instanceof Date) {
      updatedAt = docData.updatedAt;
    } else if (typeof docData.updatedAt === 'number') {
      updatedAt = new Date(docData.updatedAt);
    } else if (typeof docData.updatedAt === 'string') {
      updatedAt = new Date(docData.updatedAt);
    }
  }

  const booking: Booking = {
    id,
    userId: docData.userId,
    courtId: docData.courtId,
    createdAt,
    updatedAt,
  };

  // Add optional fields
  if (docData.isGoing !== undefined) {
    booking.isGoing = docData.isGoing;
  }
  if (docData.slotIndex !== undefined) {
    booking.slotIndex = docData.slotIndex;
  }
  if (docData.status) {
    booking.status = docData.status;
  }

  return booking;
}

// Helper function to convert Booking object to Firestore document
function bookingToFirestoreDoc(booking: Partial<Booking>): any {
  const doc: any = {
    userId: booking.userId,
    courtId: booking.courtId,
    createdAt: booking.createdAt ? Timestamp.fromDate(booking.createdAt) : Timestamp.now(),
  };

  if (booking.updatedAt) {
    doc.updatedAt = Timestamp.fromDate(booking.updatedAt);
  }
  if (booking.isGoing !== undefined) {
    doc.isGoing = booking.isGoing;
  }
  if (booking.slotIndex !== undefined) {
    doc.slotIndex = booking.slotIndex;
  }
  if (booking.status) {
    doc.status = booking.status;
  }

  return doc;
}

// Helper function to get user name from Firestore
const getUserName = async (userId: string): Promise<string> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.name || 'User';
    }
    // Fallback if user document doesn't exist
    return 'User';
  } catch (error) {
    console.error('Error fetching user name from Firestore:', error);
    return 'User';
  }
};

export const mockBookingService: BookingService = {
  /**
   * Get all bookings for a specific user
   */
  getUserBookings: async (userId: string) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = [];
      querySnapshot.forEach((docSnapshot) => {
        bookings.push(firestoreDocToBooking(docSnapshot.data(), docSnapshot.id));
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  },

  /**
   * Create booking/RSVP for outdoor court
   */
  createOutdoorBooking: async (courtId: string, userId: string) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const newBooking: Partial<Booking> = {
        userId,
        courtId,
        isGoing: true,
        createdAt: new Date(),
      };

      const docRef = await addDoc(bookingsRef, bookingToFirestoreDoc(newBooking));
      return {
        id: docRef.id,
        ...newBooking,
        createdAt: newBooking.createdAt!,
      } as Booking;
    } catch (error) {
      console.error('Error creating outdoor booking:', error);
      throw error;
    }
  },

  /**
   * Remove outdoor booking/RSVP
   */
  cancelOutdoorBooking: async (courtId: string, userId: string) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('userId', '==', userId),
        where('isGoing', '==', true)
      );
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, 'bookings', docSnapshot.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cancelling outdoor booking:', error);
      throw error;
    }
  },

  /**
   * Request indoor court slot
   * For FCFS mode: immediately confirms and assigns slot, or waitlists if full
   * For Priority mode: creates pending booking (no slot assigned yet), or waitlists if full
   */
  requestIndoorSlot: async (
    courtId: string,
    userId: string,
    bookingMode?: 'fcfs' | 'priority',
    maxSlots?: number
  ) => {
    try {
      const bookingsRef = collection(db, 'bookings');

      // Get all confirmed bookings for this court (those with slotIndex)
      const confirmedBookingsQuery = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('status', '==', 'confirmed')
      );
      const confirmedSnapshot = await getDocs(confirmedBookingsQuery);

      const confirmedBookings: Booking[] = [];
      confirmedSnapshot.forEach((docSnapshot) => {
        const booking = firestoreDocToBooking(docSnapshot.data(), docSnapshot.id);
        if (booking.slotIndex !== undefined) {
          confirmedBookings.push(booking);
        }
      });

      const currentSlotsFilled = confirmedBookings.length;
      const isFull = maxSlots !== undefined && currentSlotsFilled >= maxSlots;

      // For FCFS mode: assign slot immediately if available, else waitlist
      if (bookingMode === 'fcfs') {
        if (isFull) {
          // Court is full - add to waitlist
          const newBooking: Partial<Booking> = {
            userId,
            courtId,
            status: 'waitlisted',
            createdAt: new Date(),
          };

          const docRef = await addDoc(bookingsRef, bookingToFirestoreDoc(newBooking));
          return {
            id: docRef.id,
            ...newBooking,
            createdAt: newBooking.createdAt!,
          } as Booking;
        }

        // Court has space - assign slot immediately
        const maxSlotIndex = confirmedBookings.reduce((max, b) => {
          return b.slotIndex !== undefined && b.slotIndex > max ? b.slotIndex : max;
        }, -1);

        const newBooking: Partial<Booking> = {
          userId,
          courtId,
          status: 'confirmed',
          slotIndex: maxSlotIndex + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const docRef = await addDoc(bookingsRef, bookingToFirestoreDoc(newBooking));
        return {
          id: docRef.id,
          ...newBooking,
          createdAt: newBooking.createdAt!,
          updatedAt: newBooking.updatedAt!,
        } as Booking;
      }

      // For Priority mode (or undefined): create pending booking if not full, else waitlist
      if (isFull) {
        // Court is full - add to waitlist
        const newBooking: Partial<Booking> = {
          userId,
          courtId,
          status: 'waitlisted',
          createdAt: new Date(),
        };

        const docRef = await addDoc(bookingsRef, bookingToFirestoreDoc(newBooking));
        return {
          id: docRef.id,
          ...newBooking,
          createdAt: newBooking.createdAt!,
        } as Booking;
      }

      // Court has space - create pending booking (will be assigned later)
      const newBooking: Partial<Booking> = {
        userId,
        courtId,
        status: 'pending',
        createdAt: new Date(),
      };

      const docRef = await addDoc(bookingsRef, bookingToFirestoreDoc(newBooking));
      return {
        id: docRef.id,
        ...newBooking,
        createdAt: newBooking.createdAt!,
      } as Booking;
    } catch (error) {
      console.error('Error requesting indoor slot:', error);
      throw error;
    }
  },

  /**
   * Cancel indoor slot booking
   * If a confirmed booking is cancelled (had slotIndex), promotes the first waitlisted person to fill the slot
   */
  cancelIndoorBooking: async (bookingId: string, courtId?: string, maxSlots?: number) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        return;
      }

      const cancelledBooking = firestoreDocToBooking(bookingSnap.data(), bookingSnap.id);
      const freedSlotIndex = cancelledBooking.slotIndex;
      const courtIdForWaitlist = courtId || cancelledBooking.courtId;

      // Delete the cancelled booking
      await deleteDoc(bookingRef);

      // If the cancelled booking had a slotIndex (was in main list), promote first waitlisted person
      if (freedSlotIndex !== undefined && courtIdForWaitlist) {
        // Find the first waitlisted booking for this court (ordered by createdAt)
        const bookingsRef = collection(db, 'bookings');
        const waitlistedQuery = query(
          bookingsRef,
          where('courtId', '==', courtIdForWaitlist),
          where('status', '==', 'waitlisted'),
          orderBy('createdAt', 'asc')
        );
        const waitlistedSnapshot = await getDocs(waitlistedQuery);

        if (!waitlistedSnapshot.empty) {
          const firstWaitlistedDoc = waitlistedSnapshot.docs[0];
          const firstWaitlistedRef = doc(db, 'bookings', firstWaitlistedDoc.id);

          // Promote first waitlisted person to confirmed with the freed slot
          await updateDoc(firstWaitlistedRef, {
            status: 'confirmed',
            slotIndex: freedSlotIndex,
            updatedAt: Timestamp.now(),
          });
        }
      }
    } catch (error) {
      console.error('Error cancelling indoor booking:', error);
      throw error;
    }
  },

  /**
   * Get list of participants for a court
   * Returns participants sorted: confirmed (by slot), pending, waitlisted (by creation time)
   */
  getCourtParticipants: async (courtId: string): Promise<Participant[]> => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('courtId', '==', courtId));
      const querySnapshot = await getDocs(q);

      const courtBookings: Booking[] = [];
      querySnapshot.forEach((docSnapshot) => {
        courtBookings.push(firestoreDocToBooking(docSnapshot.data(), docSnapshot.id));
      });

      // Sort waitlisted bookings by createdAt to determine waitlist position
      const waitlistedBookings = courtBookings
        .filter((b) => b.status === 'waitlisted')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Fetch user names for all participants
      const participants = await Promise.all(
        courtBookings.map(async (booking) => {
          const userName = await getUserName(booking.userId);
          // Calculate waitlist position for waitlisted users
          const waitlistPosition =
            booking.status === 'waitlisted'
              ? waitlistedBookings.findIndex((b) => b.id === booking.id) + 1
              : undefined;

          return {
            userId: booking.userId,
            userName: userName,
            bookingId: booking.id, // Include booking ID for admin operations
            slotIndex: booking.slotIndex,
            status: booking.status || 'confirmed',
            waitlistPosition, // Position in waitlist (1-based)
          };
        })
      );

      return participants;
    } catch (error) {
      console.error('Error fetching court participants:', error);
      return [];
    }
  },

  /**
   * Get booking status for a specific court and user
   */
  getBookingStatus: async (courtId: string, userId: string) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnapshot = querySnapshot.docs[0];
      return firestoreDocToBooking(docSnapshot.data(), docSnapshot.id);
    } catch (error) {
      console.error('Error fetching booking status:', error);
      return null;
    }
  },

  /**
   * Move a participant to a different slot position (Admin only)
   * For indoor courts - reorders slot assignments
   */
  moveParticipant: async (courtId: string, userId: string, newSlotIndex: number) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('userId', '==', userId)
      );
      const bookingSnapshot = await getDocs(q);

      if (bookingSnapshot.empty) {
        throw new Error('Booking not found');
      }

      const bookingDoc = bookingSnapshot.docs[0];
      const booking = firestoreDocToBooking(bookingDoc.data(), bookingDoc.id);

      // Get all bookings for this court that have slot indices
      const courtBookingsQuery = query(bookingsRef, where('courtId', '==', courtId));
      const courtBookingsSnapshot = await getDocs(courtBookingsQuery);

      const courtBookings: { id: string; booking: Booking }[] = [];
      courtBookingsSnapshot.forEach((docSnapshot) => {
        const b = firestoreDocToBooking(docSnapshot.data(), docSnapshot.id);
        if (b.slotIndex !== undefined) {
          courtBookings.push({ id: docSnapshot.id, booking: b });
        }
      });

      const oldSlotIndex = booking.slotIndex;

      // Use a batch to update multiple documents atomically
      const batch = writeBatch(db);

      // If moving to a position that's already occupied, swap
      const targetBooking = courtBookings.find(
        (b) => b.booking.slotIndex === newSlotIndex && b.id !== bookingDoc.id
      );

      if (targetBooking && oldSlotIndex !== undefined) {
        // Swap slots
        const targetRef = doc(db, 'bookings', targetBooking.id);
        batch.update(targetRef, {
          slotIndex: oldSlotIndex,
          updatedAt: Timestamp.now(),
        });
      } else if (oldSlotIndex !== undefined) {
        // Shift other participants
        if (newSlotIndex < oldSlotIndex) {
          // Moving up - shift participants down
          courtBookings.forEach((b) => {
            if (
              b.booking.slotIndex !== undefined &&
              b.booking.slotIndex >= newSlotIndex &&
              b.booking.slotIndex < oldSlotIndex &&
              b.id !== bookingDoc.id
            ) {
              const ref = doc(db, 'bookings', b.id);
              batch.update(ref, {
                slotIndex: (b.booking.slotIndex || 0) + 1,
                updatedAt: Timestamp.now(),
              });
            }
          });
        } else if (newSlotIndex > oldSlotIndex) {
          // Moving down - shift participants up
          courtBookings.forEach((b) => {
            if (
              b.booking.slotIndex !== undefined &&
              b.booking.slotIndex > oldSlotIndex &&
              b.booking.slotIndex <= newSlotIndex &&
              b.id !== bookingDoc.id
            ) {
              const ref = doc(db, 'bookings', b.id);
              batch.update(ref, {
                slotIndex: (b.booking.slotIndex || 0) - 1,
                updatedAt: Timestamp.now(),
              });
            }
          });
        }
      }

      // Update the booking's slot index
      const bookingRef = doc(db, 'bookings', bookingDoc.id);
      batch.update(bookingRef, {
        slotIndex: newSlotIndex,
        updatedAt: Timestamp.now(),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error moving participant:', error);
      throw error;
    }
  },
};
