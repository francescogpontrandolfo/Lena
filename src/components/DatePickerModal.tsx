// Date Picker Modal - Simple month/day picker for birthday

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const getDaysInMonth = (month: number): number[] => {
  const daysCount = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] || 31;
  return Array.from({ length: daysCount }, (_, i) => i + 1);
};

interface DatePickerModalProps {
  visible: boolean;
  currentDate?: string; // ISO date string (YYYY-MM-DD)
  onSelect: (date: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function DatePickerModal({
  visible,
  currentDate,
  onSelect,
  onClear,
  onClose,
}: DatePickerModalProps) {
  // Parse current date or default to today
  const parsedDate = currentDate ? new Date(currentDate) : new Date();
  const [selectedMonth, setSelectedMonth] = useState(parsedDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(parsedDate.getDate());

  const handleSave = () => {
    // Use year 2000 as placeholder (we only care about month/day for birthdays)
    const month = selectedMonth.toString().padStart(2, '0');
    const day = selectedDay.toString().padStart(2, '0');
    onSelect(`2000-${month}-${day}`);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const days = getDaysInMonth(selectedMonth);

  // Adjust day if it exceeds days in selected month
  React.useEffect(() => {
    if (selectedDay > days.length) {
      setSelectedDay(days.length);
    }
  }, [selectedMonth]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Set Birthday</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Preview */}
              <View style={styles.preview}>
                <Text style={styles.previewText}>
                  {MONTHS[selectedMonth - 1]?.label} {selectedDay}
                </Text>
              </View>

              {/* Pickers */}
              <View style={styles.pickersRow}>
                {/* Month picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <ScrollView
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                  >
                    {MONTHS.map((month) => (
                      <TouchableOpacity
                        key={month.value}
                        style={[
                          styles.pickerItem,
                          selectedMonth === month.value && styles.pickerItemSelected,
                        ]}
                        onPress={() => setSelectedMonth(month.value)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedMonth === month.value && styles.pickerItemTextSelected,
                        ]}>
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Day picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <ScrollView
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                  >
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.pickerItem,
                          selectedDay === day && styles.pickerItemSelected,
                        ]}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.pickerItemTextSelected,
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {currentDate && (
                  <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                    <Text style={styles.clearButtonText}>Remove Birthday</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  preview: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  previewText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  pickersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  picker: {
    height: 180,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  pickerContent: {
    padding: spacing.xs,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary,
  },
  pickerItemText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: colors.card,
    fontWeight: typography.weights.semibold,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  clearButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: typography.sizes.md,
    color: colors.error,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
});
