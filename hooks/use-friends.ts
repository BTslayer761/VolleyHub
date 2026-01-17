/**
 * Custom hook for fetching and managing friends
 * Separates data fetching logic from UI components
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendService } from '@/lib/services/friend-service';
import { Friend, FriendRequest } from '@/shared/types/friend.types';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setFriends([]);
        setPendingRequests([]);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      const [friendsList, receivedRequests, sentRequestsList] = await Promise.all([
        friendService.getFriends(user.id),
        friendService.getPendingRequests(user.id),
        friendService.getSentRequests(user.id),
      ]);

      setFriends(friendsList);
      setPendingRequests(receivedRequests);
      setSentRequests(sentRequestsList);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load friends');
      setError(error);
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  /**
   * Send a friend request
   */
  const sendFriendRequest = async (emailOrUsername: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await friendService.sendFriendRequest(user.id, emailOrUsername);
      // Reload friends and requests after sending
      await loadFriends();
    } catch (err) {
      console.error('Error sending friend request:', err);
      throw err;
    }
  };

  /**
   * Accept a friend request
   */
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await friendService.acceptFriendRequest(requestId, user.id);
      // Reload friends and requests after accepting
      await loadFriends();
    } catch (err) {
      console.error('Error accepting friend request:', err);
      throw err;
    }
  };

  /**
   * Reject a friend request
   */
  const rejectFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await friendService.rejectFriendRequest(requestId, user.id);
      // Reload requests after rejecting
      await loadFriends();
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      throw err;
    }
  };

  /**
   * Cancel a sent friend request
   */
  const cancelSentRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await friendService.cancelSentRequest(requestId, user.id);
      // Reload requests after canceling
      await loadFriends();
    } catch (err) {
      console.error('Error canceling sent request:', err);
      throw err;
    }
  };

  /**
   * Remove a friend
   */
  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await friendService.removeFriend(user.id, friendId);
      // Reload friends after removing
      await loadFriends();
    } catch (err) {
      console.error('Error removing friend:', err);
      throw err;
    }
  };

  /**
   * Get friends attending a court
   */
  const getFriendsAttendingCourt = async (courtId: string): Promise<Friend[]> => {
    if (!user) return [];

    try {
      return await friendService.getFriendsAttendingCourt(user.id, courtId);
    } catch (err) {
      console.error('Error getting friends attending court:', err);
      return [];
    }
  };

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    error,
    refetch: loadFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelSentRequest,
    removeFriend,
    getFriendsAttendingCourt,
  };
}
