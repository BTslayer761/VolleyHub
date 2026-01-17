/**
 * Admin Page: Create Test Users
 * Allows administrators to create test users in Firebase
 * Accessible only to administrators
 */

import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TEST_USERS = [
  { email: 'admin@gmail.com', password: 'admin123', name: 'Admin User', role: 'administrator' },
  { email: 'user1@volleyhub.com', password: 'user123', name: 'Alice Johnson', role: 'user' },
  { email: 'user2@volleyhub.com', password: 'user123', name: 'Bob Smith', role: 'user' },
  { email: 'user3@volleyhub.com', password: 'user123', name: 'Charlie Brown', role: 'user' },
  { email: 'user4@volleyhub.com', password: 'user123', name: 'Diana Prince', role: 'user' },
  { email: 'user5@volleyhub.com', password: 'user123', name: 'Ethan Hunt', role: 'user' },
  { email: 'user6@volleyhub.com', password: 'user123', name: 'Fiona Chen', role: 'user' },
  { email: 'user7@volleyhub.com', password: 'user123', name: 'George Wilson', role: 'user' },
  { email: 'user8@volleyhub.com', password: 'user123', name: 'Hannah Lee', role: 'user' },
  { email: 'user9@volleyhub.com', password: 'user123', name: 'Ian Martinez', role: 'user' },
  { email: 'user10@volleyhub.com', password: 'user123', name: 'Julia Kim', role: 'user' },
  { email: 'user11@volleyhub.com', password: 'user123', name: 'Kevin Park', role: 'user' },
  { email: 'user12@volleyhub.com', password: 'user123', name: 'Lisa Anderson', role: 'user' },
  { email: 'user13@volleyhub.com', password: 'user123', name: 'Mike Davis', role: 'user' },
  { email: 'user14@volleyhub.com', password: 'user123', name: 'Nancy Taylor', role: 'user' },
  { email: 'user15@volleyhub.com', password: 'user123', name: 'Oliver White', role: 'user' },
  { email: 'user16@volleyhub.com', password: 'user123', name: 'Patricia Harris', role: 'user' },
  { email: 'user17@volleyhub.com', password: 'user123', name: 'Quinn Jackson', role: 'user' },
  { email: 'user18@volleyhub.com', password: 'user123', name: 'Rachel Green', role: 'user' },
  { email: 'user19@volleyhub.com', password: 'user123', name: 'Sam Thompson', role: 'user' },
  { email: 'user20@volleyhub.com', password: 'user123', name: 'Tina Wong', role: 'user' },
];

export default function CreateUsersScreen() {
  const router = useRouter();
  const { hasRole, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: TEST_USERS.length, success: 0, errors: 0, skipped: 0 });

  // Check if user is admin
  if (!isAuthenticated || !hasRole('administrator')) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.errorText}>
          Access Denied
        </ThemedText>
        <ThemedText style={styles.errorSubtext}>
          This page is only accessible to administrators.
        </ThemedText>
      </ThemedView>
    );
  }

  const createAllUsers = async () => {
    setIsCreating(true);
    setProgress({ current: 0, total: TEST_USERS.length, success: 0, errors: 0, skipped: 0 });

    for (let i = 0; i < TEST_USERS.length; i++) {
      const userData = TEST_USERS[i];
      setProgress((prev) => ({ ...prev, current: i + 1 }));

      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        const user = userCredential.user;

        // Create user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setProgress((prev) => ({ ...prev, success: prev.success + 1 }));
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          setProgress((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
        } else {
          console.error(`Error creating user ${userData.email}:`, error);
          setProgress((prev) => ({ ...prev, errors: prev.errors + 1 }));
        }
      }
    }

    setIsCreating(false);
    Alert.alert(
      'Complete',
      `Created ${progress.success} users\nSkipped ${progress.skipped} (already exist)\nErrors: ${progress.errors}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Create Test Users
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.description}>
            This will create 20 test users in Firebase Authentication and Firestore.
          </ThemedText>
          <ThemedText style={styles.note}>
            Users that already exist will be skipped.
          </ThemedText>
        </ThemedView>

        {isCreating && (
          <ThemedView style={styles.progressSection}>
            <ThemedText style={styles.progressText}>
              Creating users... {progress.current} / {progress.total}
            </ThemedText>
            <ThemedText style={styles.progressStats}>
              ✅ Success: {progress.success} | ⚠️ Skipped: {progress.skipped} | ❌ Errors: {progress.errors}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.usersList}>
          <ThemedText style={styles.listTitle}>Users to be created:</ThemedText>
          {TEST_USERS.map((user, index) => (
            <ThemedView key={index} style={styles.userItem}>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              <ThemedText style={styles.userName}>{user.name}</ThemedText>
              <ThemedView
                style={[
                  styles.roleBadge,
                  { backgroundColor: user.role === 'administrator' ? '#EF444420' : '#3B82F620' },
                ]}>
                <ThemedText
                  style={[
                    styles.roleText,
                    { color: user.role === 'administrator' ? '#EF4444' : '#3B82F6' },
                  ]}>
                  {user.role === 'administrator' ? 'Admin' : 'User'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor:
                colorScheme === 'dark' ? '#0a7ea4' : Colors[colorScheme ?? 'light'].tint,
              opacity: isCreating ? 0.6 : 1,
            },
          ]}
          onPress={createAllUsers}
          disabled={isCreating}>
          <ThemedText style={styles.createButtonText}>
            {isCreating ? 'Creating Users...' : 'Create All Test Users'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.credentialsSection}>
          <ThemedText style={styles.credentialsTitle}>Login Credentials:</ThemedText>
          <ThemedText style={styles.credentialsText}>
            Admin: admin@gmail.com / admin123
          </ThemedText>
          <ThemedText style={styles.credentialsText}>
            Users: user1@volleyhub.com through user20@volleyhub.com / user123
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  progressSection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressStats: {
    fontSize: 14,
    opacity: 0.8,
  },
  usersList: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  userItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  userName: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  credentialsSection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 16,
  },
  errorSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
