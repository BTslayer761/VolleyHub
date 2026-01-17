/**
 * Court Status Modal Component
 * Allows administrators to update the status of outdoor courts
 * (e.g., rain, category 1, closed, etc.)
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { courtService } from '@/lib/services/court-service';
import { OutdoorCourtStatus } from '@/shared/types/court.types';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface CourtStatusModalProps {
  visible: boolean;
  courtId: string;
  courtName: string;
  currentStatus?: OutdoorCourtStatus;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const STATUS_OPTIONS: { value: OutdoorCourtStatus; label: string; description: string }[] = [
  { value: 'available', label: 'Available', description: 'Court is available for use' },
  { value: 'rain', label: 'Rain', description: 'Court unavailable due to rain' },
  { value: 'cat1', label: 'Category 1', description: 'Court closed - Category 1 alert' },
  { value: 'closed', label: 'Closed', description: 'Court is closed' },
  { value: 'cancelled', label: 'Cancelled', description: 'Session cancelled' },
];

export default function CourtStatusModal({
  visible,
  courtId,
  courtName,
  currentStatus,
  onClose,
  onStatusUpdated,
}: CourtStatusModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const [selectedStatus, setSelectedStatus] = useState<OutdoorCourtStatus>(
    currentStatus || 'available'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await courtService.updateCourt(courtId, { status: selectedStatus });
      Alert.alert('Success', 'Court status updated successfully!');
      onStatusUpdated();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update court status. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: OutdoorCourtStatus): string => {
    switch (status) {
      case 'available':
        return '#22c55e'; // Green
      case 'rain':
        return '#3b82f6'; // Blue
      case 'cat1':
        return '#ef4444'; // Red
      case 'closed':
        return '#f59e0b'; // Orange
      case 'cancelled':
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <ThemedView style={styles.modalOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
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
                Update Court Status
              </ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </ThemedView>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled">
              {/* Court Name */}
              <ThemedView style={styles.section}>
                <ThemedText style={styles.courtNameLabel}>Court:</ThemedText>
                <ThemedText type="subtitle" style={styles.courtName}>
                  {courtName}
                </ThemedText>
              </ThemedView>

              {/* Current Status */}
              {currentStatus && (
                <ThemedView style={styles.section}>
                  <ThemedText style={styles.label}>Current Status:</ThemedText>
                  <ThemedView
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(currentStatus) + '20' },
                    ]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
                      {STATUS_OPTIONS.find((opt) => opt.value === currentStatus)?.label}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {/* Status Selection */}
              <ThemedView style={styles.section}>
                <ThemedText style={styles.label}>Select New Status *</ThemedText>
                <ThemedView style={styles.statusOptions}>
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = selectedStatus === option.value;
                    const statusColor = getStatusColor(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          borderRadius: 12,
                          borderColor: statusColor,
                          borderWidth: isSelected ? 2 : 1,
                          backgroundColor: statusColor + (colorScheme === 'dark' ? '20' : '15'),
                          minHeight: 70,
                        }}
                        onPress={() => setSelectedStatus(option.value)}>
                        <ThemedView style={[styles.statusOptionContent, { backgroundColor: 'transparent' }]}>
                          <ThemedText
                            style={{
                              fontWeight: isSelected ? '700' : '600',
                              opacity: isSelected ? 1 : 0.7,
                              fontSize: 16,
                              marginBottom: 4,
                            }}>
                            {option.label}
                          </ThemedText>
                          <ThemedText
                            style={{
                              opacity: isSelected ? 0.8 : 0.6,
                              fontSize: 14,
                            }}>
                            {option.description}
                          </ThemedText>
                        </ThemedView>
                        {isSelected && (
                          <IconSymbol
                            name="checkmark.circle.fill"
                            size={24}
                            color={statusColor}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ThemedView>
              </ThemedView>

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
                  {isSubmitting ? 'Updating...' : 'Update Status'}
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  courtNameLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 4,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusOptions: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 70,
  },
  statusOptionActive: {},
  statusOptionContent: {
    flex: 1,
  },
  statusOptionLabel: {
    // Styles moved to inline to ensure color precedence
  },
  statusOptionDescription: {
    // Styles moved to inline to ensure color precedence
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
