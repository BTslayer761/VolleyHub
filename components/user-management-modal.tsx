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
import { User, UserRole } from '@/shared/types/auth.types';
import { useAuth } from '@/contexts/AuthContext';

interface UserManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export function UserManagementModal({ visible, onClose }: UserManagementModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const cardBackground = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)';
  
  const { user: currentUser, updateUserRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

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
          role: (data.role as UserRole) || 'user',
          createdAt,
        });
      });

      // Sort by name client-side (in case orderBy failed or wasn't used)
      loadedUsers.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (targetUser: User) => {
    if (!currentUser || currentUser.role !== 'administrator') {
      Alert.alert('Error', 'Only administrators can promote users.');
      return;
    }

    if (targetUser.role === 'administrator') {
      Alert.alert('Info', 'This user is already an administrator.');
      return;
    }

    Alert.alert(
      'Promote to Administrator',
      `Are you sure you want to promote ${targetUser.name} (${targetUser.email}) to administrator?\n\nThis will give them full admin privileges.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Promote',
          style: 'default',
          onPress: async () => {
            setPromotingUserId(targetUser.id);
            try {
              await updateUserRole(targetUser.id, 'administrator');
              
              // Update local state
              setUsers((prevUsers) =>
                prevUsers.map((u) =>
                  u.id === targetUser.id ? { ...u, role: 'administrator' } : u
                )
              );
              setFilteredUsers((prevUsers) =>
                prevUsers.map((u) =>
                  u.id === targetUser.id ? { ...u, role: 'administrator' } : u
                )
              );

              Alert.alert('Success', `${targetUser.name} has been promoted to administrator.`);
            } catch (error: any) {
              console.error('Error promoting user:', error);
              Alert.alert('Error', error.message || 'Failed to promote user. Please try again.');
            } finally {
              setPromotingUserId(null);
            }
          },
        },
      ]
    );
  };

  const handleDemoteToUser = async (targetUser: User) => {
    if (!currentUser || currentUser.role !== 'administrator') {
      Alert.alert('Error', 'Only administrators can demote users.');
      return;
    }

    if (targetUser.role === 'user') {
      Alert.alert('Info', 'This user is already a regular user.');
      return;
    }

    const isSelf = targetUser.id === currentUser.id;
    const warningMessage = isSelf
      ? `Are you sure you want to demote yourself to a regular user?\n\nYou will lose all administrator privileges and will need another admin to restore them.`
      : `Are you sure you want to demote ${targetUser.name} (${targetUser.email}) to a regular user?\n\nThey will lose all administrator privileges.`;

    Alert.alert(
      'Demote to User',
      warningMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Demote',
          style: 'destructive',
          onPress: async () => {
            setPromotingUserId(targetUser.id);
            try {
              await updateUserRole(targetUser.id, 'user');
              
              // Update local state
              setUsers((prevUsers) =>
                prevUsers.map((u) =>
                  u.id === targetUser.id ? { ...u, role: 'user' } : u
                )
              );
              setFilteredUsers((prevUsers) =>
                prevUsers.map((u) =>
                  u.id === targetUser.id ? { ...u, role: 'user' } : u
                )
              );

              Alert.alert('Success', `${targetUser.name} has been demoted to regular user.`);
            } catch (error: any) {
              console.error('Error demoting user:', error);
              Alert.alert('Error', error.message || 'Failed to demote user. Please try again.');
            } finally {
              setPromotingUserId(null);
            }
          },
        },
      ]
    );
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
              Manage Users
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
                  const isAdmin = user.role === 'administrator';
                  const isPromoting = promotingUserId === user.id;
                  const isCurrentUser = user.id === currentUser?.id;

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
                          <View style={styles.roleContainer}>
                            <View
                              style={[
                                styles.roleBadge,
                                {
                                  backgroundColor: isAdmin
                                    ? themeColors.tint + '20'
                                    : 'rgba(128, 128, 128, 0.2)',
                                },
                              ]}>
                              <ThemedText
                                style={[
                                  styles.roleText,
                                  {
                                    color: isAdmin ? themeColors.tint : textColor,
                                    opacity: isAdmin ? 1 : 0.7,
                                  },
                                ]}>
                                {isAdmin ? 'Administrator' : 'User'}
                              </ThemedText>
                            </View>
                            {isCurrentUser && (
                              <ThemedText style={[styles.currentUserLabel, { opacity: 0.5 }]}>
                                (You)
                              </ThemedText>
                            )}
                          </View>
                        </View>
                      </View>
                      <View style={styles.actionButtons}>
                        {!isAdmin && (
                          <TouchableOpacity
                            style={[
                              styles.promoteButton,
                              {
                                backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint,
                                opacity: isPromoting ? 0.6 : 1,
                              },
                            ]}
                            onPress={() => handlePromoteToAdmin(user)}
                            disabled={isPromoting}
                            activeOpacity={0.8}>
                            {isPromoting ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <IconSymbol name="star.fill" size={16} color="#fff" />
                                <ThemedText style={styles.promoteButtonText}>Promote</ThemedText>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                        {isAdmin && (
                          <TouchableOpacity
                            style={[
                              styles.demoteButton,
                              {
                                backgroundColor: colorScheme === 'dark' ? '#dc2626' : '#ef4444',
                                opacity: isPromoting ? 0.6 : 1,
                              },
                            ]}
                            onPress={() => handleDemoteToUser(user)}
                            disabled={isPromoting}
                            activeOpacity={0.8}>
                            {isPromoting ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <IconSymbol name="arrow.down.circle.fill" size={16} color="#fff" />
                                <ThemedText style={styles.demoteButtonText}>
                                  {isCurrentUser ? 'Demote Self' : 'Demote'}
                                </ThemedText>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentUserLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoteButton: {
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
  promoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  demoteButton: {
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
  demoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
