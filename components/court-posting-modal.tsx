import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { courtService } from '@/lib/services/court-service';
import { CourtType } from '@/shared/types/court.types';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface CourtPostingModalProps {
  visible: boolean;
  onClose: () => void;
  onCourtCreated: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CourtPostingModal({
  visible,
  onClose,
  onCourtCreated,
}: CourtPostingModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const [courtType, setCourtType] = useState<CourtType>('outdoor');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxSlots, setMaxSlots] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setLocation('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setMaxSlots('');
    setCourtType('outdoor');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a court name');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter a location');
      return false;
    }
    if (!date.trim()) {
      Alert.alert('Validation Error', 'Please enter a date');
      return false;
    }
    if (!startTime.trim()) {
      Alert.alert('Validation Error', 'Please enter a start time');
      return false;
    }
    if (!endTime.trim()) {
      Alert.alert('Validation Error', 'Please enter an end time');
      return false;
    }
    if (courtType === 'indoor' && (!maxSlots.trim() || parseInt(maxSlots) <= 0)) {
      Alert.alert('Validation Error', 'Please enter a valid number of slots for indoor courts');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const courtDate = new Date(date);
      if (isNaN(courtDate.getTime())) {
        Alert.alert('Validation Error', 'Please enter a valid date');
        setIsSubmitting(false);
        return;
      }

      const courtData: any = {
        name: name.trim(),
        type: courtType,
        location: location.trim(),
        date: courtDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        bookingMode: courtType === 'indoor' ? 'fcfs' : undefined,
      };

      if (courtType === 'indoor' && maxSlots) {
        courtData.maxSlots = parseInt(maxSlots);
      }

      await courtService.createCourt(courtData);
      Alert.alert('Success', 'Court posted successfully!');
      handleClose();
      onCourtCreated();
    } catch (error) {
      Alert.alert('Error', 'Failed to post court. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <ThemedView
        style={styles.modalOverlay}
        pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}>
          <ThemedView
            style={[
              styles.modalContent,
              {
                backgroundColor,
              },
            ]}>
            {/* Header */}
            <ThemedView
              style={[
                styles.header,
                {
                  borderBottomColor: Colors[colorScheme ?? 'light'].icon + '30',
                },
              ]}>
              <ThemedText type="title" style={styles.modalTitle}>
                Post New Court
              </ThemedText>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </ThemedView>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled">
            {/* Court Type Selection */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.label}>Court Type *</ThemedText>
              <ThemedView style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    courtType === 'outdoor' && styles.typeButtonActive,
                    {
                      borderColor: Colors[colorScheme ?? 'light'].tint,
                      backgroundColor:
                        courtType === 'outdoor'
                          ? Colors[colorScheme ?? 'light'].tint + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => setCourtType('outdoor')}>
                  <ThemedText
                    style={[
                      styles.typeButtonText,
                      courtType === 'outdoor' && styles.typeButtonTextActive,
                    ]}>
                    Outdoor
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    courtType === 'indoor' && styles.typeButtonActive,
                    {
                      borderColor: Colors[colorScheme ?? 'light'].tint,
                      backgroundColor:
                        courtType === 'indoor'
                          ? Colors[colorScheme ?? 'light'].tint + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => setCourtType('indoor')}>
                  <ThemedText
                    style={[
                      styles.typeButtonText,
                      courtType === 'indoor' && styles.typeButtonTextActive,
                    ]}>
                    Indoor
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            {/* Court Name */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.label}>Court Name *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                  },
                ]}
                placeholder="e.g., Outdoor Volleyball Court"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={name}
                onChangeText={setName}
              />
            </ThemedView>

            {/* Location */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.label}>Location *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                  },
                ]}
                placeholder="e.g., USC Volleyball Court"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={location}
                onChangeText={setLocation}
              />
            </ThemedView>

            {/* Date */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.label}>Date *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                  },
                ]}
                placeholder="YYYY-MM-DD (e.g., 2026-01-25)"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={date}
                onChangeText={setDate}
              />
            </ThemedView>

            {/* Time */}
            <ThemedView style={styles.section}>
              <ThemedView style={styles.timeRow}>
                <ThemedView style={styles.timeInputContainer}>
                  <ThemedText style={styles.label}>Start Time *</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      styles.timeInput,
                      {
                        color: Colors[colorScheme ?? 'light'].text,
                        borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                      },
                    ]}
                    placeholder="HH:MM (e.g., 18:00)"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </ThemedView>
                <ThemedView style={styles.timeInputContainer}>
                  <ThemedText style={styles.label}>End Time *</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      styles.timeInput,
                      {
                        color: Colors[colorScheme ?? 'light'].text,
                        borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                      },
                    ]}
                    placeholder="HH:MM (e.g., 20:00)"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Max Slots (Indoor only) */}
            {courtType === 'indoor' && (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.label}>Max Number of People *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: Colors[colorScheme ?? 'light'].text,
                      borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                    },
                  ]}
                  placeholder="e.g., 12"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                  value={maxSlots}
                  onChangeText={setMaxSlots}
                  keyboardType="number-pad"
                />
                <ThemedText style={styles.helpText}>
                  Maximum number of people allowed for this indoor court
                </ThemedText>
              </ThemedView>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? '#0a7ea4' : Colors[colorScheme ?? 'light'].tint,
                  opacity: isSubmitting ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              <ThemedText style={styles.submitButtonText}>
                {isSubmitting ? 'Posting...' : 'Post Court'}
              </ThemedText>
            </TouchableOpacity>
            </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        maxHeight: SCREEN_HEIGHT * 0.85,
        height: SCREEN_HEIGHT * 0.75,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      default: {
        maxHeight: '90%',
      },
      android: {
        maxHeight: '90%',
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonActive: {},
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeInput: {
    minHeight: 48,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
