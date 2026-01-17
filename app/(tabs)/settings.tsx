import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, Platform, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { NamePromptModal } from '@/components/name-prompt-modal';
import { UserManagementModal } from '@/components/user-management-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

// Animated button component with haptic feedback
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Sporty card component with entrance animation
function SportyCard({ children, style, delay = 0 }: { children: React.ReactNode; style?: any; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400, delay });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150, delay });
    scale.value = withSpring(1, { damping: 15, stiffness: 150, delay });
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// Profile info row with tap-to-edit
function ProfileInfoRow({
  label,
  value,
  onEdit,
  icon,
  accessibilityLabel,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  icon: string;
  accessibilityLabel?: string;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const cardBackground = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)';

  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const handlePressIn = () => {
    pressed.value = true;
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    pressed.value = false;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.profileCard,
        {
          backgroundColor: cardBackground,
          borderColor,
        },
        animatedStyle,
      ]}
      onPress={onEdit}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${label}: ${value}. Tap to edit`}
      accessibilityHint="Double tap to edit this information">
      <View style={styles.profileCardContent}>
        <View style={styles.profileCardLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: themeColors.tint + '15',
              },
            ]}>
            <IconSymbol name={icon} size={20} color={themeColors.tint} />
          </View>
          <View style={styles.profileCardText}>
            <ThemedText style={[styles.profileLabel, { opacity: 0.7 }]}>{label}</ThemedText>
            <ThemedText style={[styles.profileValue, { color: textColor }]} numberOfLines={1}>
              {value}
            </ThemedText>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={16} color={themeColors.tint} style={{ opacity: 0.5 }} />
      </View>
    </AnimatedTouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout, updateUserName, hasRole } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
  const themeColors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  const isAdmin = hasRole('administrator');

  const handleEditName = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsNameModalVisible(true);
  };

  const handleSaveName = async (name: string) => {
    try {
      await updateUserName(name);
      setIsNameModalVisible(false);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Announce success to screen readers
      AccessibilityInfo.announceForAccessibility('Name updated successfully');
    } catch (error) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            await logout();
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'No email';

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#E6E6E6', dark: '#2D2D2D' }}
        headerImage={
          <Image
            source={require('@/assets/images/volleyball.png')}
            style={styles.headerVolleyballImage}
            contentFit="contain"
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

        {/* Profile Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profile
          </ThemedText>

          {/* Name Card */}
          <SportyCard delay={0}>
            <ProfileInfoRow
              label="Display Name"
              value={displayName}
              onEdit={handleEditName}
              icon="person.fill"
              accessibilityLabel={`Display name: ${displayName}. Tap to edit your name`}
            />
          </SportyCard>

          {/* Email Card */}
          <SportyCard delay={100}>
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`Email: ${displayEmail}`}>
              <View style={styles.profileCardContent}>
                <View style={styles.profileCardLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: themeColors.tint + '15',
                      },
                    ]}>
                    <IconSymbol name="envelope.fill" size={20} color={themeColors.tint} />
                  </View>
                  <View style={styles.profileCardText}>
                    <ThemedText style={[styles.profileLabel, { opacity: 0.7 }]}>Email</ThemedText>
                    <ThemedText style={[styles.profileValue, { opacity: 0.8 }]} numberOfLines={1}>
                      {displayEmail}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </SportyCard>
        </ThemedView>

        {/* Admin Section */}
        {isAdmin && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Administrator
            </ThemedText>

            {/* Manage Users Button */}
            <SportyCard delay={200}>
              <AnimatedTouchableOpacity
                style={[
                  styles.adminButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  setIsUserManagementVisible(true);
                }}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Manage Users"
                accessibilityHint="Double tap to view and manage all users"
                entering={FadeInDown.delay(200).springify()}>
                <IconSymbol name="person.3.fill" size={22} color="#fff" />
                <ThemedText style={styles.adminButtonText}>Manage Users</ThemedText>
              </AnimatedTouchableOpacity>
            </SportyCard>
          </ThemedView>
        )}

        {/* Actions Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Actions
          </ThemedText>

          {/* Logout Button */}
          <SportyCard delay={isAdmin ? 300 : 200}>
            <AnimatedTouchableOpacity
              style={[
                styles.logoutButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#dc2626' : '#ef4444',
                },
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Logout"
              accessibilityHint="Double tap to log out of your account"
              entering={FadeInDown.delay(isAdmin ? 300 : 200).springify()}>
              <IconSymbol name="arrow.right.square.fill" size={22} color="#fff" />
              <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
            </AnimatedTouchableOpacity>
          </SportyCard>
        </ThemedView>
      </ParallaxScrollView>

      {/* Name Edit Modal */}
      <NamePromptModal
        visible={isNameModalVisible}
        currentName={user?.name}
        onSave={handleSaveName}
      />

      {/* User Management Modal */}
      {isAdmin && (
        <UserManagementModal
          visible={isUserManagementVisible}
          onClose={() => setIsUserManagementVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerVolleyballImage: {
    width: 200,
    height: 200,
    position: 'absolute',
    bottom: -100,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    // Sporty shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 64, // Minimum touch target for accessibility
  },
  profileCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCardText: {
    flex: 1,
    gap: 4,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    minHeight: 56, // Minimum touch target for accessibility
    // Sporty shadow
    ...Platform.select({
      ios: {
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    minHeight: 56, // Minimum touch target for accessibility
    // Sporty shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
