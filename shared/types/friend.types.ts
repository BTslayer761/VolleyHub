/**
 * Friend Service Interface
 * 
 * This interface defines the contract for friend operations.
 * Supports friend requests, friend list management, and friend activity tracking.
 */

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Friend {
  id: string;
  userId: string; // The friend's user ID
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastActive?: Date;
  // Future: mutualFriends, commonBookings, etc.
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserName?: string; // Recipient's name (for sent requests)
  toUserEmail?: string; // Recipient's email (for sent requests)
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FriendService {
  /**
   * Get all friends for a user
   */
  getFriends(userId: string): Promise<Friend[]>;

  /**
   * Send a friend request to another user
   * @param toUserId - User ID to send request to
   * @param toUserEmailOrUsername - Email or username to search for user
   */
  sendFriendRequest(
    fromUserId: string,
    toUserEmailOrUsername: string
  ): Promise<FriendRequest>;

  /**
   * Get pending friend requests for a user (received requests)
   */
  getPendingRequests(userId: string): Promise<FriendRequest[]>;

  /**
   * Get sent friend requests for a user (requests you sent)
   */
  getSentRequests(userId: string): Promise<FriendRequest[]>;

  /**
   * Accept a friend request
   */
  acceptFriendRequest(requestId: string, userId: string): Promise<void>;

  /**
   * Reject a friend request
   */
  rejectFriendRequest(requestId: string, userId: string): Promise<void>;

  /**
   * Cancel a sent friend request (delete it)
   */
  cancelSentRequest(requestId: string, userId: string): Promise<void>;

  /**
   * Remove a friend
   */
  removeFriend(userId: string, friendId: string): Promise<void>;

  /**
   * Check if two users are friends
   */
  areFriends(userId1: string, userId2: string): Promise<boolean>;

  /**
   * Get friends who are attending a specific court booking
   */
  getFriendsAttendingCourt(userId: string, courtId: string): Promise<Friend[]>;
}
