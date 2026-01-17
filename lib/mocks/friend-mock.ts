/**
 * Mock Friend Service
 * 
 * Temporary mock implementation for development.
 * Will be replaced with Firebase/Firestore implementation.
 */

import {
  FriendService,
  Friend,
  FriendRequest,
  FriendRequestStatus,
} from '@/shared/types/friend.types';

// Mock data storage (in-memory)
const mockFriends: Map<string, Friend[]> = new Map();
const mockFriendRequests: FriendRequest[] = [];

// Mock user database (for finding users by email/username)
const mockUsers: Map<string, { id: string; name: string; email: string }> = new Map([
  ['alice@example.com', { id: 'user-alice', name: 'Alice Johnson', email: 'alice@example.com' }],
  ['bob@example.com', { id: 'user-bob', name: 'Bob Smith', email: 'bob@example.com' }],
  ['charlie@example.com', { id: 'user-charlie', name: 'Charlie Brown', email: 'charlie@example.com' }],
  ['diana@example.com', { id: 'user-diana', name: 'Diana Prince', email: 'diana@example.com' }],
]);

// Initialize with some mock friends for user-123
mockFriends.set('user-123', [
  {
    id: 'user-alice',
    userId: 'user-alice',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    isOnline: true,
    lastActive: new Date(),
  },
  {
    id: 'user-bob',
    userId: 'user-bob',
    name: 'Bob Smith',
    email: 'bob@example.com',
    isOnline: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'user-charlie',
    userId: 'user-charlie',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    isOnline: true,
    lastActive: new Date(),
  },
]);

export const mockFriendService: FriendService = {
  /**
   * Get all friends for a user
   */
  async getFriends(userId: string): Promise<Friend[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFriends.get(userId) || [];
  },

  /**
   * Send a friend request
   */
  async sendFriendRequest(
    fromUserId: string,
    toUserEmailOrUsername: string
  ): Promise<FriendRequest> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In real implementation, this would query Firestore to find user by email
    // For now, we need to get user info from Firestore
    let toUser: { id: string; name: string; email: string } | null = null;
    
    // Try to find user in mockUsers first (for testing)
    toUser = mockUsers.get(toUserEmailOrUsername.toLowerCase()) || null;
    
    // If not found in mockUsers, try to get from Firestore
    if (!toUser) {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/config/firebase');
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', toUserEmailOrUsername.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          toUser = {
            id: userDoc.id,
            name: userData.name || toUserEmailOrUsername.split('@')[0] || 'User',
            email: userData.email || toUserEmailOrUsername,
          };
          // Cache in mockUsers for future lookups
          mockUsers.set(toUserEmailOrUsername.toLowerCase(), toUser);
        }
      } catch (error) {
        console.error('Error fetching user from Firestore:', error);
      }
    }
    
    // If still not found, create a temporary entry (for development)
    if (!toUser) {
      const tempUserId = `user-${toUserEmailOrUsername.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      toUser = {
        id: tempUserId,
        name: toUserEmailOrUsername.split('@')[0] || 'User',
        email: toUserEmailOrUsername,
      };
      mockUsers.set(toUserEmailOrUsername.toLowerCase(), toUser);
    }

    // Check if already friends
    const userFriends = mockFriends.get(fromUserId) || [];
    if (userFriends.some((f) => f.userId === toUser!.id)) {
      throw new Error('Already friends with this user');
    }

    // Check if request already exists (in either direction)
    const existingRequest = mockFriendRequests.find(
      (req) =>
        ((req.fromUserId === fromUserId && req.toUserId === toUser!.id) ||
         (req.fromUserId === toUser!.id && req.toUserId === fromUserId)) &&
        req.status === 'pending'
    );
    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    // Get sender info from Firestore or use defaults
    let fromUser: { name: string; email: string } = {
      name: 'Current User',
      email: 'user@example.com',
    };
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase');
      
      const userDocRef = doc(db, 'users', fromUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        fromUser = {
          name: userData.name || fromUser.name,
          email: userData.email || fromUser.email,
        };
      }
    } catch (error) {
      console.error('Error fetching sender info from Firestore:', error);
    }

    // Create friend request
    const request: FriendRequest = {
      id: `request-${Date.now()}-${Math.random()}`,
      fromUserId,
      toUserId: toUser.id,
      fromUserName: fromUser.name,
      fromUserEmail: fromUser.email,
      status: 'pending',
      createdAt: new Date(),
    };

    mockFriendRequests.push(request);
    return request;
  },

  /**
   * Get pending friend requests (received)
   * NOTE: This is now deprecated - use friendService from lib/services/friend-service.ts
   */
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockFriendRequests.filter(
      (req) => req.toUserId === userId && req.status === 'pending'
    );
  },

  /**
   * Get sent friend requests
   */
  async getSentRequests(userId: string): Promise<FriendRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockFriendRequests.filter(
      (req) => req.fromUserId === userId && req.status === 'pending'
    );
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const request = mockFriendRequests.find((req) => req.id === requestId);
    if (!request || request.toUserId !== userId) {
      throw new Error('Friend request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    // Update request status
    request.status = 'accepted';
    request.updatedAt = new Date();

    // Add to both users' friend lists
    const fromUser = mockUsers.get(request.fromUserEmail.toLowerCase());
    const toUser = mockUsers.get(userId); // In real app, get from auth

    if (fromUser && toUser) {
      // Add to requester's friend list
      const requesterFriends = mockFriends.get(request.fromUserId) || [];
      if (!requesterFriends.some((f) => f.userId === userId)) {
        requesterFriends.push({
          id: userId,
          userId,
          name: toUser.name || 'User',
          email: toUser.email || '',
          isOnline: false,
          lastActive: new Date(),
        });
        mockFriends.set(request.fromUserId, requesterFriends);
      }

      // Add to recipient's friend list
      const recipientFriends = mockFriends.get(userId) || [];
      if (!recipientFriends.some((f) => f.userId === request.fromUserId)) {
        recipientFriends.push({
          id: request.fromUserId,
          userId: request.fromUserId,
          name: fromUser.name,
          email: fromUser.email,
          isOnline: false,
          lastActive: new Date(),
        });
        mockFriends.set(userId, recipientFriends);
      }
    }
  },

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const request = mockFriendRequests.find((req) => req.id === requestId);
    if (!request || request.toUserId !== userId) {
      throw new Error('Friend request not found');
    }

    request.status = 'rejected';
    request.updatedAt = new Date();
  },

  /**
   * Remove a friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userFriends = mockFriends.get(userId) || [];
    mockFriends.set(
      userId,
      userFriends.filter((f) => f.userId !== friendId)
    );

    // Also remove from friend's list (bidirectional)
    const friendFriends = mockFriends.get(friendId) || [];
    mockFriends.set(
      friendId,
      friendFriends.filter((f) => f.userId !== userId)
    );
  },

  /**
   * Check if two users are friends
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const user1Friends = mockFriends.get(userId1) || [];
    return user1Friends.some((f) => f.userId === userId2);
  },

  /**
   * Get friends attending a court
   */
  async getFriendsAttendingCourt(
    userId: string,
    courtId: string
  ): Promise<Friend[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // TODO: In real implementation, check bookings for this court
    // For now, return empty array
    return [];
  },
};
