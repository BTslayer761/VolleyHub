import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface NamePromptModalProps {
  visible: boolean;
  currentName?: string;
  onSave: (name: string) => Promise<void>;
}

export function NamePromptModal({ visible, currentName, onSave }: NamePromptModalProps) {
  const [name, setName] = useState(currentName || '');

  // Update name when currentName prop changes
  useEffect(() => {
    if (visible) {
      setName(currentName || '');
    }
  }, [visible, currentName]);
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = colorScheme === 'dark' ? '#444' : '#ddd';
  const inputBackgroundColor = colorScheme === 'dark' ? '#222' : '#f9f9f9';

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    try {
      await onSave(trimmedName);
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save name. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <ThemedView style={[styles.modal, { backgroundColor }]}>
          <ThemedText type="title" style={styles.title}>
            {currentName ? 'Update Your Name' : 'Welcome! Please Enter Your Name'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {currentName 
              ? 'Update your display name that will be shown to other users.'
              : 'Your name will be displayed when you join courts.'}
          </ThemedText>
          
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: borderColor,
                backgroundColor: inputBackgroundColor,
              }
            ]}
            placeholder="Enter your name"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={50}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                !name.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!name.trim()}>
              <ThemedText style={styles.buttonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
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
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
