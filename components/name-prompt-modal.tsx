import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View, Platform, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';

interface NamePromptModalProps {
  visible: boolean;
  currentName?: string;
  onSave: (name: string) => Promise<void>;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export function NamePromptModal({ visible, currentName, onSave }: NamePromptModalProps) {
  const [name, setName] = useState(currentName || '');
  const [isSaving, setIsSaving] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const inputBackgroundColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)';

  const buttonScale = useSharedValue(1);
  const inputFocus = useSharedValue(0);

  // Update name when currentName prop changes
  useEffect(() => {
    if (visible) {
      setName(currentName || '');
      // Announce modal to screen readers
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(
          currentName ? 'Update your name' : 'Welcome! Please enter your name'
        );
      }, 300);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsSaving(true);
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });

    try {
      await onSave(trimmedName);
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } catch (error) {
      console.error('Error saving name:', error);
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Failed to save name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputFocus = () => {
    inputFocus.value = withSpring(1, { damping: 15, stiffness: 200 });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleInputBlur = () => {
    inputFocus.value = withSpring(0, { damping: 15, stiffness: 200 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => {
    const borderWidth = 1 + inputFocus.value * 1;
    const scale = 1 + inputFocus.value * 0.02;
    return {
      borderWidth,
      transform: [{ scale }],
      borderColor: inputFocus.value
        ? themeColors.tint
        : borderColor,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      accessible={true}
      accessibilityViewIsModal={true}>
      <AnimatedView
        style={styles.overlay}
        entering={FadeIn.duration(200)}
        accessible={false}>
        <AnimatedView
          style={[styles.modal, { backgroundColor }]}
          entering={ZoomIn.springify().damping(15).stiffness(150)}
          accessible={true}
          accessibilityLabel={currentName ? 'Update your name' : 'Welcome! Please enter your name'}>
          <ThemedText type="title" style={styles.title}>
            {currentName ? 'Update Your Name' : 'Welcome! Please Enter Your Name'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {currentName
              ? 'Update your display name that will be shown to other users.'
              : 'Your name will be displayed when you join courts.'}
          </ThemedText>

          <Animated.View style={inputAnimatedStyle}>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: inputBackgroundColor,
                },
              ]}
              placeholder="Enter your name"
              placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
              value={name}
              onChangeText={setName}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoFocus
              maxLength={50}
              editable={!isSaving}
              accessible={true}
              accessibilityLabel="Name input field"
              accessibilityHint="Enter your display name"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </Animated.View>

          <View style={styles.buttonContainer}>
            <AnimatedTouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: !name.trim() ? borderColor : themeColors.tint,
                  borderWidth: 1,
                  opacity: !name.trim() ? 0.6 : 1,
                },
                buttonAnimatedStyle,
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!name.trim() || isSaving}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isSaving ? 'Saving name' : 'Save name'}
              accessibilityState={{ disabled: !name.trim() || isSaving }}
              entering={FadeInDown.delay(200).springify()}>
              <ThemedText style={[styles.buttonText, { color: textColor }]}>
                {isSaving ? 'Saving...' : 'Save'}
              </ThemedText>
            </AnimatedTouchableOpacity>
          </View>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    // Sporty shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 56, // Minimum touch target
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Minimum touch target
  },
  saveButton: {
    // backgroundColor and borderColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
