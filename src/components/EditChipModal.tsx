// Edit Chip Modal - Generic bottom sheet for editing chip values

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

interface EditOption {
  value: string | number;
  label: string;
}

interface EditChipModalProps {
  visible: boolean;
  title: string;
  options: EditOption[];
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  onClose: () => void;
}

export default function EditChipModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: EditChipModalProps) {
  const handleOptionPress = (value: string | number) => {
    onSelect(value);
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
                {options.map((option) => {
                  const isSelected = selectedValue === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => handleOptionPress(option.value)}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}>
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
    maxHeight: '60%',
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
    paddingBottom: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight + '30',
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
  optionLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
});
