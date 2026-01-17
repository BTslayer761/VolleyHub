import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { NamePromptModal } from '@/components/name-prompt-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
  const { user, logout, updateUserName } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);

  const handleEditName = () => {
    setIsNameModalVisible(true);
  };

  const handleSaveName = async (name: string) => {
    await updateUserName(name);
    setIsNameModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#E6E6E6', dark: '#2D2D2D' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="gearshape.fill"
            style={styles.headerImage}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
            }}>
            Settings
          </ThemedText>
        </ThemedView>

        {/* User Name Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profile
          </ThemedText>
          
          {/* Name with Edit Button */}
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <ThemedText type="defaultSemiBold" style={styles.nameValue}>
                {displayName}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditName}
              activeOpacity={0.7}>
              <ThemedText 
                style={[
                  styles.editButtonText,
                  { color: Colors[colorScheme ?? 'light'].tint }
                ]}>
                edit
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* Email */}
          <ThemedText style={styles.emailText}>{user?.email}</ThemedText>
          
          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor:
                  colorScheme === 'dark' ? '#dc2626' : '#ef4444',
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <IconSymbol name="arrow.right.square" size={20} color="#fff" />
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>

      {/* Name Edit Modal */}
      <NamePromptModal
        visible={isNameModalVisible}
        currentName={user?.name}
        onSave={handleSaveName}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nameValue: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
  emailText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
