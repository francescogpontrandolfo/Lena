// Filter Modal Component - Bottom sheet for selecting filter options

import React from 'react';
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

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterModalProps {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  multiSelect?: boolean;
  onSelect: (values: string[]) => void;
  onClose: () => void;
}

export default function FilterModal({
  visible,
  title,
  options,
  selectedValues,
  multiSelect = false,
  onSelect,
  onClose,
}: FilterModalProps) {
  const handleOptionPress = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        onSelect(selectedValues.filter(v => v !== value));
      } else {
        onSelect([...selectedValues, value]);
      }
    } else {
      onSelect(value === selectedValues[0] ? [] : [value]);
      onClose();
    }
  };

  const handleClearAll = () => {
    onSelect([]);
    onClose();
  };

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
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Options */}
              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                {/* Clear all option */}
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedValues.length === 0 && styles.optionSelected,
                  ]}
                  onPress={handleClearAll}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.radio,
                      selectedValues.length === 0 && styles.radioSelected,
                    ]}>
                      {selectedValues.length === 0 && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[
                      styles.optionLabel,
                      selectedValues.length === 0 && styles.optionLabelSelected,
                    ]}>
                      All
                    </Text>
                  </View>
                </TouchableOpacity>

                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => handleOptionPress(option.value)}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          multiSelect ? styles.checkbox : styles.radio,
                          isSelected && (multiSelect ? styles.checkboxSelected : styles.radioSelected),
                        ]}>
                          {isSelected && (
                            multiSelect
                              ? <Text style={styles.checkmark}>✓</Text>
                              : <View style={styles.radioInner} />
                          )}
                        </View>
                        <Text style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}>
                          {option.label}
                        </Text>
                      </View>
                      <Text style={styles.optionCount}>({option.count})</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Done button for multi-select */}
              {multiSelect && (
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    maxHeight: '70%',
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
  optionsList: {
    paddingVertical: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.card,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  optionLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    fontWeight: typography.weights.medium,
  },
  optionCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
});
