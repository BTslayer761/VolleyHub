/**
 * Friend Service - Firebase Firestore Implementation
 * Real-time friend data with Firestore integration
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
import {
  FriendService,
  Friend,
  FriendRequest,
  FriendRequestStatus,
} from '@/shared/types/friend.types';

// Helper function to convert Firestore document to FriendRequest
function firestoreDocToFriendRequest(docData: any, id: string): FriendRequest {
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

  return {
    id,
    fromUserId: docData.fromUserId,
    toUserId: docData.toUserId,
    fromUserName: docData.fromUserName || 'User',
    fromUserEmail: docData.fromUserEmail || '',
    toUserName: docData.toUserName,
    toUserEmail: docData.toUserEmail,
    status: (docData.status as FriendRequestStatus) || 'pending',
    createdAt,
    updatedAt,
  };
}

// Helper function to convert FriendRequest to Firestore document
function friendRequestToFirestoreDoc(request: Partial<FriendRequest>): any {
  const doc: any = {
    fromUserId: request.fromUserId,
    toUserId: request.toUserId,
    fromUserName: request.fromUserName,
    fromUserEmail: request.fromUserEmail,
    status: request.status || 'pending',
  };

  // Include recipient info if available
  if (request.toUserName) {
    doc.toUserName = request.toUserName;
  }
  if (request.toUserEmail) {
    doc.toUserEmail = request.toUserEmail;
  }

  if (request.createdAt) {
    doc.createdAt = Timestamp.fromDate(request.createdAt);
  } else {
    doc.createdAt = Timestamp.now();
  }

  if (request.updatedAt) {
    doc.updatedAt = Timestamp.fromDate(request.updatedAt);
  }

  return doc;
}

// Helper function to get user info from Firestore
async function getUserInfo(userId: string): Promise<{ name: string; email: string } | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        name: userData.name || 'User',
        email: userData.email || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export const friendService: FriendService = {
  /**
   * Get all friends for a user
   * Friends are stored as documents in the 'friends' collection
   * Each document has userId1 and userId2 fields (sorted alphabetically)
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const friendsRef = collection(db, 'friends');
      
      // Get all friend relationships where this user is involved
      const q = query(
        friendsRef,
        where('userId1', '==', userId)
      );
      const querySnapshot1 = await getDocs(q);
      
      const q2 = query(
        friendsRef,
        where('userId2', '==', userId)
      );
      const querySnapshot2 = await getDocs(q2);

      const friendIds = new Set<string>();
      
      // Collect friend IDs from both queries
      querySnapshot1.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.userId2) {
          friendIds.add(data.userId2);
        }
      });
      
      querySnapshot2.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.userId1) {
          friendIds.add(data.userId1);
        }
      });

      // Fetch user info for each friend
      const friends: Friend[] = [];
      for (const friendId of friendIds) {
        const userInfo = await getUserInfo(friendId);
        if (userInfo) {
          friends.push({
            id: friendId,
            userId: friendId,
            name: userInfo.name,
            email: userInfo.email,
            isOnline: false, // TODO: Implement online status tracking
            lastActive: new Date(), // TODO: Implement last active tracking
          });
        }
      }

      return friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  },

  /**
   * Send a friend request
   */
  async sendFriendRequest(
    fromUserId: string,
    toUserEmailOrUsername: string
  ): Promise<FriendRequest> {
    try {
      // Find user by email in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', toUserEmailOrUsername.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const toUserDoc = querySnapshot.docs[0];
      const toUserId = toUserDoc.id;
      const toUserData = toUserDoc.data();

      if (toUserId === fromUserId) {
        throw new Error('Cannot send friend request to yourself');
      }

      // Check if already friends
      const areFriends = await this.areFriends(fromUserId, toUserId);
      if (areFriends) {
        throw new Error('Already friends with this user');
      }

      // Check if request already exists
      const requestsRef = collection(db, 'friendRequests');
      const existingRequestQuery = query(
        requestsRef,
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
      );
      const existingSnapshot = await getDocs(existingRequestQuery);

      if (!existingSnapshot.empty) {
        throw new Error('Friend request already sent');
      }

      // Check reverse request
      const reverseRequestQuery = query(
        requestsRef,
        where('fromUserId', '==', toUserId),
        where('toUserId', '==', fromUserId),
        where('status', '==', 'pending')
      );
      const reverseSnapshot = await getDocs(reverseRequestQuery);

      if (!reverseSnapshot.empty) {
        throw new Error('This user has already sent you a friend request');
      }

      // Get sender and recipient info
      const fromUserInfo = await getUserInfo(fromUserId);
      if (!fromUserInfo) {
        throw new Error('Sender user not found');
      }

      const toUserInfo = await getUserInfo(toUserId);
      if (!toUserInfo) {
        throw new Error('Recipient user not found');
      }

      // Create friend request
      const request: Partial<FriendRequest> = {
        fromUserId,
        toUserId,
        fromUserName: fromUserInfo.name,
        fromUserEmail: fromUserInfo.email,
        toUserName: toUserInfo.name,
        toUserEmail: toUserInfo.email,
        status: 'pending',
        createdAt: new Date(),
      };

      const docRef = await addDoc(requestsRef, friendRequestToFirestoreDoc(request));

      return {
        id: docRef.id,
        ...request,
        createdAt: request.createdAt!,
      } as FriendRequest;
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  /**
   * Get pending friend requests (received)
   */
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('toUserId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (no index), get all and sort client-side
        console.warn('orderBy failed, sorting client-side:', orderByError);
        const q2 = query(
          requestsRef,
          where('toUserId', '==', userId),
          where('status', '==', 'pending')
        );
        querySnapshot = await getDocs(q2);
      }

      const requests: FriendRequest[] = [];
      querySnapshot.forEach((docSnapshot) => {
        requests.push(firestoreDocToFriendRequest(docSnapshot.data(), docSnapshot.id));
      });

      // Sort by createdAt if orderBy failed
      if (requests.length > 0 && !requests[0].createdAt) {
        requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return requests;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  /**
   * Get sent friend requests
   */
  async getSentRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('fromUserId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (no index), get all and sort client-side
        console.warn('orderBy failed, sorting client-side:', orderByError);
        const q2 = query(
          requestsRef,
          where('fromUserId', '==', userId),
          where('status', '==', 'pending')
        );
        querySnapshot = await getDocs(q2);
      }

      const requests: FriendRequest[] = [];
      
      // Process requests and fetch recipient info if missing
      for (const docSnapshot of querySnapshot.docs) {
        const requestData = docSnapshot.data();
        let request = firestoreDocToFriendRequest(requestData, docSnapshot.id);
        
        // If recipient info is missing, fetch it
        if (!request.toUserName || !request.toUserEmail) {
          const recipientInfo = await getUserInfo(request.toUserId);
          if (recipientInfo) {
            request.toUserName = recipientInfo.name;
            request.toUserEmail = recipientInfo.email;
            
            // Update the document in Firestore with recipient info for future queries
            try {
              await updateDoc(docSnapshot.ref, {
                toUserName: recipientInfo.name,
                toUserEmail: recipientInfo.email,
              });
            } catch (updateError) {
              // If update fails, continue anyway - we have the info in memory
              console.warn('Failed to update request with recipient info:', updateError);
            }
          }
        }
        
        requests.push(request);
      }

      // Sort by createdAt if orderBy failed
      if (requests.length > 0) {
        requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return requests;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return [];
    }
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestsRef = collection(db, 'friendRequests');
      const requestDocRef = doc(requestsRef, requestId);
      const requestDoc = await getDoc(requestDocRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.toUserId !== userId) {
        throw new Error('You are not the recipient of this request');
      }

      if (requestData.status !== 'pending') {
        throw new Error('Friend request already processed');
      }

      const fromUserId = requestData.fromUserId;
      const toUserId = requestData.toUserId;

      // Use batch write to ensure atomicity
      const batch = writeBatch(db);

      // Update request status
      batch.update(requestDocRef, {
        status: 'accepted',
        updatedAt: Timestamp.now(),
      });

      // Create friend relationship (sorted IDs to avoid duplicates)
      const friendsRef = collection(db, 'friends');
      const friendDocId = [fromUserId, toUserId].sort().join('_');
      const friendDocRef = doc(friendsRef, friendDocId);

      // Check if friendship already exists
      const friendDoc = await getDoc(friendDocRef);
      if (!friendDoc.exists()) {
        batch.set(friendDocRef, {
          userId1: [fromUserId, toUserId].sort()[0],
          userId2: [fromUserId, toUserId].sort()[1],
          createdAt: Timestamp.now(),
        });
      }

      await batch.commit();
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestsRef = collection(db, 'friendRequests');
      const requestDocRef = doc(requestsRef, requestId);
      const requestDoc = await getDoc(requestDocRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.toUserId !== userId) {
        throw new Error('You are not the recipient of this request');
      }

      await updateDoc(requestDocRef, {
        status: 'rejected',
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  },

  /**
   * Cancel a sent friend request (delete it)
   */
  async cancelSentRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestsRef = collection(db, 'friendRequests');
      const requestDocRef = doc(requestsRef, requestId);
      const requestDoc = await getDoc(requestDocRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.fromUserId !== userId) {
        throw new Error('You are not the sender of this request');
      }

      if (requestData.status !== 'pending') {
        throw new Error('Cannot cancel a request that has already been processed');
      }

      await deleteDoc(requestDocRef);
    } catch (error: any) {
      console.error('Error canceling sent request:', error);
      throw error;
    }
  },

  /**
   * Remove a friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const friendsRef = collection(db, 'friends');
      const friendDocId = [userId, friendId].sort().join('_');
      const friendDocRef = doc(friendsRef, friendDocId);

      const friendDoc = await getDoc(friendDocRef);
      if (!friendDoc.exists()) {
        throw new Error('Friendship not found');
      }

      await deleteDoc(friendDocRef);
    } catch (error: any) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },

  /**
   * Check if two users are friends
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const friendsRef = collection(db, 'friends');
      const friendDocId = [userId1, userId2].sort().join('_');
      const friendDocRef = doc(friendsRef, friendDocId);
      const friendDoc = await getDoc(friendDocRef);
      return friendDoc.exists();
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  },

  /**
   * Get friends attending a court
   */
  async getFriendsAttendingCourt(userId: string, courtId: string): Promise<Friend[]> {
    try {
      // Get user's friends
      const friends = await this.getFriends(userId);

      // Get all bookings for this court
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('status', 'in', ['confirmed', 'pending'])
      );
      const querySnapshot = await getDocs(q);

      const attendingUserIds = new Set<string>();
      querySnapshot.forEach((docSnapshot) => {
        const bookingData = docSnapshot.data();
        if (bookingData.userId && bookingData.userId !== userId) {
          attendingUserIds.add(bookingData.userId);
        }
      });

      // Filter friends who are attending
      return friends.filter((friend) => attendingUserIds.has(friend.userId));
    } catch (error) {
      console.error('Error getting friends attending court:', error);
      return [];
    }
  },
};
