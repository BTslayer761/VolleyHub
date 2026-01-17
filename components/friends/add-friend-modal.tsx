/**
 * AddFriendModal Component
 * Modal for adding friends - reuses UI from UserManagementModal
 * Shows searchable list of users to add as friends
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User } from '@/shared/types/auth.types';
import { useAuth } from '@/contexts/AuthContext';
import { Friend } from '@/shared/types/friend.types';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFriend?: (emailOrUsername: string) => Promise<void>; // Optional, modal handles it directly
  friends?: Friend[]; // Current friends list to filter out
  onSendFriendRequest?: (emailOrUsername: string) => Promise<void>; // Function to send friend request
}

export function AddFriendModal({ visible, onClose, onAddFriend, friends = [], onSendFriendRequest }: AddFriendModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const cardBackground = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)';

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingRequestUserId, setSendingRequestUserId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadUsers();
    } else {
      // Reset when modal closes
      setUsers([]);
      setFilteredUsers([]);
      setSearchQuery('');
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter((user) => {
        const name = user.name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        return name.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Try to query with orderBy, but fallback to client-side sorting if it fails
      let querySnapshot;
      try {
        const q = query(usersRef, orderBy('name', 'asc'));
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (e.g., no index), just get all users and sort client-side
        console.warn('orderBy failed, sorting client-side:', orderByError);
        querySnapshot = await getDocs(usersRef);
      }

      const loadedUsers: User[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // Convert Firestore Timestamp to Date
        let createdAt: Date | undefined;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else if (typeof data.createdAt === 'number') {
            createdAt = new Date(data.createdAt);
          } else if (typeof data.createdAt === 'string') {
            createdAt = new Date(data.createdAt);
          }
        }

        loadedUsers.push({
          id: docSnapshot.id,
          email: data.email || '',
          name: data.name || 'User',
          role: data.role || 'user',
          createdAt,
        });
      });

      // Sort by name client-side (in case orderBy failed or wasn't used)
      loadedUsers.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      // Filter out current user and existing friends
      const friendIds = new Set(friends.map((f) => f.userId));
      const filtered = loadedUsers.filter(
        (user) => user.id !== currentUser?.id && !friendIds.has(user.id)
      );

      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (targetUser: User) => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to add friends.');
      return;
    }

    // Check if already friends
    const isAlreadyFriend = friends.some((f) => f.userId === targetUser.id);
    if (isAlreadyFriend) {
      Alert.alert('Info', 'You are already friends with this user.');
      return;
    }

    setSendingRequestUserId(targetUser.id);
    try {
      // Use the provided function or fallback to onAddFriend
      if (onSendFriendRequest) {
        await onSendFriendRequest(targetUser.email);
      } else if (onAddFriend) {
        await onAddFriend(targetUser.email);
      } else {
        throw new Error('No friend request handler provided');
      }
      Alert.alert('Success', `Friend request sent to ${targetUser.name}!`);
      // Reload users to update the list
      await loadUsers();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send friend request. Please try again.'
      );
    } finally {
      setSendingRequestUserId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <ThemedView
          style={[
            styles.modalContent,
            {
              backgroundColor: backgroundColor,
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              Add Friend
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: cardBackground,
                  borderColor: borderColor,
                },
              ]}
              activeOpacity={0.7}>
              <IconSymbol name="xmark" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: cardBackground,
                borderColor: borderColor,
              },
            ]}>
            <IconSymbol name="magnifyingglass" size={18} color={textColor} style={{ opacity: 0.5 }} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search by name or email..."
              placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}>
                <IconSymbol name="xmark.circle.fill" size={18} color={textColor} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            )}
          </View>

          {/* User List */}
          <View style={styles.userListContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.tint} />
                <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.userList}
                contentContainerStyle={styles.userListContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}>
                {filteredUsers.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <IconSymbol name="person.3" size={48} color={textColor} style={{ opacity: 0.3 }} />
                    <ThemedText style={styles.emptyText}>
                      {searchQuery ? 'No users found' : 'No users available'}
                    </ThemedText>
                  </View>
                ) : (
                  filteredUsers.map((user) => {
                    const isSending = sendingRequestUserId === user.id;

                    return (
                      <View
                        key={user.id}
                        style={[
                          styles.userCard,
                          {
                            backgroundColor: cardBackground,
                            borderColor: borderColor,
                          },
                        ]}>
                        <View style={styles.userInfo}>
                          <View style={styles.userDetails}>
                            <ThemedText style={styles.userName}>{user.name}</ThemedText>
                            <ThemedText style={[styles.userEmail, { opacity: 0.7 }]}>
                              {user.email}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[
                              styles.addFriendButton,
                              {
                                backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint,
                                opacity: isSending ? 0.6 : 1,
                              },
                            ]}
                            onPress={() => handleAddFriend(user)}
                            disabled={isSending}
                            activeOpacity={0.8}>
                            {isSending ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <IconSymbol name="person.badge.plus" size={16} color="#fff" />
                                <ThemedText style={styles.addFriendButtonText}>Add</ThemedText>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    height: '90%',
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  userListContainer: {
    flex: 1,
    minHeight: 0, // Important for flex children
  },
  userList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userListContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userInfo: {
    flex: 1,
  },
  userDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
