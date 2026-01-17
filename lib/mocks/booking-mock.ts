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
import { courtService } from '@/lib/services/court-service';

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

/**
 * Process deadline for a priority court - converts pending bookings to confirmed (FCFS order)
 * All bookings are now FCFS, so we just confirm pending bookings in order of creation
 */
const processDeadlineForCourt = async (courtId: string, maxSlots: number): Promise<void> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    
    // Get court details to check deadline
    const court = await courtService.getCourtById(courtId);
    if (!court || !court.deadline || court.bookingMode !== 'priority') {
      return; // Not a priority court or no deadline
    }

    const now = new Date();
    if (now < court.deadline) {
      return; // Deadline hasn't passed yet
    }

    // Get all pending bookings for this court (sorted by creation time - FCFS order)
    let pendingSnapshot;
    try {
      const pendingQuery = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc')
      );
      pendingSnapshot = await getDocs(pendingQuery);
    } catch (orderByError: any) {
      // If orderBy fails (no index), get all and sort client-side
      console.warn('orderBy failed, sorting client-side:', orderByError);
      const pendingQuery = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('status', '==', 'pending')
      );
      pendingSnapshot = await getDocs(pendingQuery);
    }

    if (pendingSnapshot.empty) {
      return; // No pending bookings to process
    }

    // Get all confirmed bookings to find available slots
    const confirmedQuery = query(
      bookingsRef,
      where('courtId', '==', courtId),
      where('status', '==', 'confirmed')
    );
    const confirmedSnapshot = await getDocs(confirmedQuery);

    const confirmedBookings: Booking[] = [];
    confirmedSnapshot.forEach((docSnapshot) => {
      const booking = firestoreDocToBooking(docSnapshot.data(), docSnapshot.id);
      if (booking.slotIndex !== undefined) {
        confirmedBookings.push(booking);
      }
    });

    const currentSlotsFilled = confirmedBookings.length;
    const maxSlotIndex = confirmedBookings.reduce((max, b) => {
      return b.slotIndex !== undefined && b.slotIndex > max ? b.slotIndex : max;
    }, -1);

    // Process pending bookings in FCFS order (by createdAt)
    const pendingBookings: Array<{ booking: Booking; docId: string }> = [];
    pendingSnapshot.forEach((docSnapshot) => {
      const booking = firestoreDocToBooking(docSnapshot.data(), docSnapshot.id);
      pendingBookings.push({
        booking,
        docId: docSnapshot.id,
      });
    });

    // Sort by creation time (FCFS order) - in case orderBy failed
    pendingBookings.sort((a, b) => a.booking.createdAt.getTime() - b.booking.createdAt.getTime());

    // Use batch to update multiple bookings atomically
    const batch = writeBatch(db);

    let nextSlotIndex = maxSlotIndex + 1;
    let slotsAssigned = 0;

    // Process in order of creation (FCFS)
    for (const { booking, docId } of pendingBookings) {
      const bookingRef = doc(db, 'bookings', docId);
      
      if (currentSlotsFilled + slotsAssigned < maxSlots) {
        // Assign slot - confirm booking (FCFS order)
        batch.update(bookingRef, {
          status: 'confirmed',
          slotIndex: nextSlotIndex,
          updatedAt: Timestamp.now(),
        });
        nextSlotIndex++;
        slotsAssigned++;
      } else {
        // No more slots available - move to waitlist
        batch.update(bookingRef, {
          status: 'waitlisted',
          updatedAt: Timestamp.now(),
        });
      }
    }

    await batch.commit();
    console.log(`Processed deadline for court ${courtId}: ${slotsAssigned} confirmed (FCFS), ${pendingBookings.length - slotsAssigned} waitlisted`);
  } catch (error) {
    console.error('Error processing deadline for court:', error);
    // Don't throw - allow the operation to continue
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
  /**
   * Create booking/RSVP for outdoor court
   * FCFS order: joining adds you to the list
   * Cancelling removes your position; rejoining puts you at the bottom (new position)
   */
  createOutdoorBooking: async (courtId: string, userId: string) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      
      // Check if user already has a booking for this court
      const existingBookingQuery = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('userId', '==', userId),
        where('isGoing', '==', true)
      );
      const existingBookingSnapshot = await getDocs(existingBookingQuery);
      
      if (!existingBookingSnapshot.empty) {
        // User already has a booking - they need to cancel first
        throw new Error('You already have a booking for this court. Please cancel it first before rejoining.');
      }

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
   * All indoor courts now use FCFS (First Come First Served):
   * - Joining adds you to the bottom of the list (new createdAt timestamp)
   * - If full, adds to waitlist
   * - Cancelling removes your position; rejoining puts you at the bottom (new position)
   * - For priority courts, deadline just confirms pending bookings in FCFS order
   */
  requestIndoorSlot: async (
    courtId: string,
    userId: string,
    bookingMode?: 'fcfs' | 'priority',
    maxSlots?: number
  ) => {
    try {
      const bookingsRef = collection(db, 'bookings');

      // Get court details
      const court = await courtService.getCourtById(courtId);
      const isPriorityMode = (bookingMode || court?.bookingMode) === 'priority';
      const deadlinePassed = court?.deadline && court.deadline < new Date();

      // Process deadline if it has passed (converts pending to confirmed in FCFS order)
      if (isPriorityMode && deadlinePassed && maxSlots !== undefined) {
        await processDeadlineForCourt(courtId, maxSlots);
      }

      // Check if user already has a booking for this court (any status: confirmed, pending, or waitlisted)
      // If they do, they should cancel first before rejoining
      // This ensures cancellation removes your position, and rejoining puts you at the bottom
      const existingBookingQuery = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('userId', '==', userId)
      );
      const existingBookingSnapshot = await getDocs(existingBookingQuery);
      
      if (!existingBookingSnapshot.empty) {
        // User already has a booking - they need to cancel first
        // This enforces: cancel removes position, rejoin puts you at bottom (new createdAt timestamp)
        throw new Error('You already have a booking for this court. Please cancel it first before rejoining.');
      }

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

      // For priority mode before deadline: create pending booking (will be confirmed at deadline in FCFS order)
      if (isPriorityMode && !deadlinePassed) {
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

        // Court has space - create pending booking (will be confirmed at deadline in FCFS order)
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
      }

      // For FCFS mode OR priority mode after deadline: assign slot immediately (add to bottom)
      if (isFull) {
        // Court is full - add to waitlist (FCFS order)
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

      // Court has space - assign slot immediately (add to bottom of list, FCFS order)
      // Calculate maxSlotIndex from all confirmed bookings with slotIndex
      // This ensures new joins are always placed at the bottom (highest slot number)
      let maxSlotIndex = -1;
      confirmedBookings.forEach((b) => {
        if (b.slotIndex !== undefined && typeof b.slotIndex === 'number') {
          if (b.slotIndex > maxSlotIndex) {
            maxSlotIndex = b.slotIndex;
          }
        }
      });

      // Next slot is one after the maximum (ensures bottom placement)
      // If maxSlotIndex is -1 (no bookings), nextSlotIndex will be 0
      const nextSlotIndex = maxSlotIndex + 1;

      console.log(`[Booking] Joining court ${courtId}: maxSlotIndex=${maxSlotIndex}, nextSlotIndex=${nextSlotIndex}, totalConfirmed=${confirmedBookings.length}`);

      const newBooking: Partial<Booking> = {
        userId,
        courtId,
        status: 'confirmed',
        slotIndex: nextSlotIndex,
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
        // Find the first waitlisted booking for this court (ordered by createdAt - FCFS order)
        const bookingsRef = collection(db, 'bookings');
        let firstWaitlistedDocId: string | null = null;
        
        try {
          // Try query with orderBy first (faster if index exists)
          const waitlistedQuery = query(
            bookingsRef,
            where('courtId', '==', courtIdForWaitlist),
            where('status', '==', 'waitlisted'),
            orderBy('createdAt', 'asc')
          );
          const waitlistedSnapshot = await getDocs(waitlistedQuery);
          
          if (!waitlistedSnapshot.empty) {
            firstWaitlistedDocId = waitlistedSnapshot.docs[0].id;
          }
        } catch (orderByError: any) {
          // If orderBy fails (no index), get all and sort client-side
          console.warn('orderBy failed in cancelIndoorBooking, sorting client-side:', orderByError);
          const waitlistedQuery = query(
            bookingsRef,
            where('courtId', '==', courtIdForWaitlist),
            where('status', '==', 'waitlisted')
          );
          const waitlistedSnapshot = await getDocs(waitlistedQuery);
          
          // Sort client-side by createdAt (FCFS order)
          const waitlistedBookings: Array<{ docId: string; createdAt: Date }> = [];
          waitlistedSnapshot.forEach((docSnapshot) => {
            const booking = firestoreDocToBooking(docSnapshot.data(), docSnapshot.id);
            waitlistedBookings.push({ docId: docSnapshot.id, createdAt: booking.createdAt });
          });
          waitlistedBookings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          
          if (waitlistedBookings.length > 0) {
            firstWaitlistedDocId = waitlistedBookings[0].docId;
          }
        }

        // Promote first waitlisted person to confirmed with the freed slot (FCFS order)
        if (firstWaitlistedDocId) {
          const firstWaitlistedRef = doc(db, 'bookings', firstWaitlistedDocId);
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
   * Also processes deadline for priority courts if it has passed (converts pending to confirmed in FCFS order)
   */
  getCourtParticipants: async (courtId: string): Promise<Participant[]> => {
    try {
      // Check if this is a priority court with deadline passed, and process pending bookings
      // Converts pending bookings to confirmed in FCFS order (by creation time)
      const court = await courtService.getCourtById(courtId);
      if (court?.bookingMode === 'priority' && court.deadline && court.deadline < new Date() && court.maxSlots) {
        // Processes pending bookings in FCFS order (by createdAt)
        await processDeadlineForCourt(courtId, court.maxSlots);
      }

      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('courtId', '==', courtId));
      const querySnapshot = await getDocs(q);

      const courtBookings: Booking[] = [];
      querySnapshot.forEach((docSnapshot) => {
        courtBookings.push(firestoreDocToBooking(docSnapshot.data(), docSnapshot.id));
      });

      // Sort all bookings by createdAt for FCFS order (outdoor courts and waitlist)
      // This ensures consistent ordering without requiring Firestore indexes
      courtBookings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

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
