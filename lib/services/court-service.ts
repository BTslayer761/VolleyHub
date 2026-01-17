/**
 * Court Service - Firebase Firestore Implementation
 * Real-time court data with Firestore integration
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
  onSnapshot,
  Query,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Court, CourtFilters, CourtService } from '@/shared/types/court.types';

// Convert Firestore document to Court object
function firestoreDocToCourt(docData: any, id: string): Court {
  // Safely convert date from Firestore Timestamp
  let date: Date;
  if (docData.date) {
    if (docData.date.toDate && typeof docData.date.toDate === 'function') {
      date = docData.date.toDate();
    } else if (docData.date instanceof Date) {
      date = docData.date;
    } else if (typeof docData.date === 'number') {
      date = new Date(docData.date);
    } else if (typeof docData.date === 'string') {
      date = new Date(docData.date);
    } else {
      date = new Date();
    }
  } else {
    date = new Date();
  }

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

  const court: Court = {
    id,
    name: docData.name,
    type: docData.type,
    location: docData.location,
    date,
    startTime: docData.startTime,
    endTime: docData.endTime,
    description: docData.description,
    createdAt,
  };

  // Outdoor court specific fields
  if (docData.status) {
    court.status = docData.status;
  }

  // Indoor court specific fields
  if (docData.maxSlots !== undefined) {
    court.maxSlots = docData.maxSlots;
  }
  if (docData.bookingMode) {
    court.bookingMode = docData.bookingMode;
  }
  if (docData.deadline) {
    // Safely convert deadline from Firestore Timestamp
    if (docData.deadline.toDate && typeof docData.deadline.toDate === 'function') {
      court.deadline = docData.deadline.toDate();
    } else if (docData.deadline instanceof Date) {
      court.deadline = docData.deadline;
    } else if (typeof docData.deadline === 'number') {
      court.deadline = new Date(docData.deadline);
    } else if (typeof docData.deadline === 'string') {
      court.deadline = new Date(docData.deadline);
    }
  }

  return court;
}

// Convert Court object to Firestore document
function courtToFirestoreDoc(court: Partial<Court>): any {
  const doc: any = {
    name: court.name,
    type: court.type,
    location: court.location,
    date: court.date ? Timestamp.fromDate(court.date) : null,
    startTime: court.startTime,
    endTime: court.endTime,
  };

  if (court.description !== undefined) {
    doc.description = court.description;
  }
  if (court.status !== undefined) {
    doc.status = court.status;
  }
  if (court.maxSlots !== undefined) {
    doc.maxSlots = court.maxSlots;
  }
  if (court.bookingMode !== undefined) {
    doc.bookingMode = court.bookingMode;
  }
  if (court.deadline !== undefined && court.deadline) {
    doc.deadline = Timestamp.fromDate(court.deadline);
  }
  if (court.createdAt !== undefined && court.createdAt) {
    doc.createdAt = Timestamp.fromDate(court.createdAt);
  }

  return doc;
}

export const courtService: CourtService = {
  /**
   * Get all courts with optional filtering
   * Returns a promise that resolves with the courts array
   */
  getCourts: async (filters?: CourtFilters): Promise<Court[]> => {
    try {
      const courtsRef = collection(db, 'courts');
      let q: Query = query(courtsRef, orderBy('date', 'asc'));

      // Apply filters
      if (filters) {
        if (filters.type) {
          q = query(q, where('type', '==', filters.type));
        }
        if (filters.dateFrom) {
          q = query(q, where('date', '>=', Timestamp.fromDate(filters.dateFrom)));
        }
        if (filters.dateTo) {
          q = query(q, where('date', '<=', Timestamp.fromDate(filters.dateTo)));
        }
        // Note: location filter is applied in-memory after fetching
      }

      const querySnapshot = await getDocs(q);
      const courts: Court[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const court = firestoreDocToCourt(docSnapshot.data(), docSnapshot.id);
        courts.push(court);
      });

      // Apply location filter in-memory if needed
      let filteredCourts = courts;
      if (filters?.location) {
        filteredCourts = courts.filter((court) =>
          court.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      return filteredCourts;
    } catch (error) {
      console.error('Error fetching courts:', error);
      throw error;
    }
  },

  /**
   * Get a single court by ID
   */
  getCourtById: async (id: string): Promise<Court | null> => {
    try {
      const courtRef = doc(db, 'courts', id);
      const courtSnap = await getDoc(courtRef);

      if (!courtSnap.exists()) {
        return null;
      }

      return firestoreDocToCourt(courtSnap.data(), courtSnap.id);
    } catch (error) {
      console.error('Error fetching court:', error);
      throw error;
    }
  },

  /**
   * Create a new court (Admin only)
   */
  createCourt: async (court: Omit<Court, 'id' | 'createdAt'>): Promise<Court> => {
    try {
      const courtsRef = collection(db, 'courts');
      const courtDoc = courtToFirestoreDoc({
        ...court,
        createdAt: new Date(),
      });

      const docRef = await addDoc(courtsRef, courtDoc);
      
      // Fetch the created document to return it
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new Error('Failed to create court');
      }

      return firestoreDocToCourt(createdDoc.data(), createdDoc.id);
    } catch (error) {
      console.error('Error creating court:', error);
      throw error;
    }
  },

  /**
   * Update an existing court (Admin only)
   */
  updateCourt: async (id: string, updates: Partial<Court>): Promise<Court> => {
    try {
      const courtRef = doc(db, 'courts', id);
      const updateData = courtToFirestoreDoc(updates);
      
      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(courtRef, updateData);

      // Fetch the updated document
      const updatedDoc = await getDoc(courtRef);
      if (!updatedDoc.exists()) {
        throw new Error('Court not found');
      }

      return firestoreDocToCourt(updatedDoc.data(), updatedDoc.id);
    } catch (error) {
      console.error('Error updating court:', error);
      throw error;
    }
  },

  /**
   * Delete a court (Admin only)
   */
  deleteCourt: async (id: string): Promise<void> => {
    try {
      const courtRef = doc(db, 'courts', id);
      await deleteDoc(courtRef);
    } catch (error) {
      console.error('Error deleting court:', error);
      throw error;
    }
  },
};

/**
 * Subscribe to real-time updates for courts
 * Returns an unsubscribe function
 */
export function subscribeToCourts(
  callback: (courts: Court[]) => void,
  filters?: CourtFilters
): Unsubscribe {
  try {
    const courtsRef = collection(db, 'courts');
    let q: Query = query(courtsRef, orderBy('date', 'asc'));

    // Apply filters
    if (filters) {
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.dateFrom) {
        q = query(q, where('date', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      if (filters.dateTo) {
        q = query(q, where('date', '<=', Timestamp.fromDate(filters.dateTo)));
      }
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const courts: Court[] = [];

        querySnapshot.forEach((docSnapshot) => {
          const court = firestoreDocToCourt(docSnapshot.data(), docSnapshot.id);
          courts.push(court);
        });

        // Apply location filter in-memory if needed
        let filteredCourts = courts;
        if (filters?.location) {
          filteredCourts = courts.filter((court) =>
            court.location.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }

        callback(filteredCourts);
      },
      (error) => {
        console.error('Error in courts subscription:', error);
        callback([]); // Return empty array on error
      }
    );
  } catch (error) {
    console.error('Error setting up courts subscription:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
}

/**
 * Subscribe to real-time updates for a single court
 * Returns an unsubscribe function
 */
export function subscribeToCourt(
  courtId: string,
  callback: (court: Court | null) => void
): Unsubscribe {
  try {
    const courtRef = doc(db, 'courts', courtId);

    return onSnapshot(
      courtRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          callback(null);
          return;
        }

        const court = firestoreDocToCourt(docSnapshot.data(), docSnapshot.id);
        callback(court);
      },
      (error) => {
        console.error('Error in court subscription:', error);
        callback(null);
      }
    );
  } catch (error) {
    console.error('Error setting up court subscription:', error);
    return () => {};
  }
}
