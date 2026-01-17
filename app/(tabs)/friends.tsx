/**
 * Friends Tab Screen
 * Displays user's friends list, add friend functionality, and friend activity
 */

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

// Friends components
import { AddFriendModal } from '@/components/friends/add-friend-modal';
import { FriendRequestsList } from '@/components/friends/friend-requests-list';
import { FriendsEmptyState } from '@/components/friends/friends-empty-state';
import { FriendsList } from '@/components/friends/friends-list';
import { SentFriendRequestsList } from '@/components/friends/sent-friend-requests-list';
import { Friend } from '@/shared/types/friend.types';

// Custom hook for friends
import { useFriends } from '@/hooks/use-friends';

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    refetch,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriends();
  
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const handleFriendPress = (friend: Friend) => {
    // TODO: Navigate to friend profile or show friend details
    console.log('Friend pressed:', friend.name);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);
      await acceptFriendRequest(requestId);
      // Friends list will refresh automatically via refetch
      await refetch(); // Explicitly refresh to show updated data
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to accept friend request. Please try again.'
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);
      await rejectFriendRequest(requestId);
      // Requests list will refresh automatically via refetch
      await refetch(); // Explicitly refresh to show updated data
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to reject friend request. Please try again.'
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Friends
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint,
              },
            ]}
            onPress={() => setIsAddFriendModalVisible(true)}
            activeOpacity={0.8}>
            <IconSymbol name="plus" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>Add Friend</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <ThemedView style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {friends.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Friends</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {friends.filter((f) => f.isOnline).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Online</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {pendingRequests.length + sentRequests.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Requests</ThemedText>
          </View>
        </ThemedView>

        {/* Sent Requests Section */}
        {sentRequests.length > 0 && (
          <ThemedView style={styles.requestsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Sent Requests ({sentRequests.length})
            </ThemedText>
            <SentFriendRequestsList requests={sentRequests} />
          </ThemedView>
        )}

        {/* Received Requests Section */}
        {pendingRequests.length > 0 && (
          <ThemedView style={styles.requestsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Received Requests ({pendingRequests.length})
            </ThemedText>
            <FriendRequestsList
              requests={pendingRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              processingRequestId={processingRequestId}
            />
          </ThemedView>
        )}

        {/* Friends List */}
        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.tint} />
            <ThemedText style={styles.loadingText}>Loading friends...</ThemedText>
          </ThemedView>
        ) : friends.length === 0 ? (
          <FriendsEmptyState />
        ) : (
          <FriendsList
            friends={friends}
            onFriendPress={handleFriendPress}
            showActivity={true}
          />
        )}

        {/* Future: Friend Activity Section */}
        {/* <ThemedView style={styles.activitySection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          // TODO: Show recent friend bookings, sessions, etc.
        </ThemedView> */}
      </ThemedView>

      {/* Add Friend Modal */}
      <AddFriendModal
        visible={isAddFriendModalVisible}
        onClose={() => {
          setIsAddFriendModalVisible(false);
          refetch(); // Refresh friends list when modal closes
        }}
        friends={friends}
        onSendFriendRequest={sendFriendRequest}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  activitySection: {
    marginTop: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  requestsSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
});
