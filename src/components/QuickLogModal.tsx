// Quick Log Modal Component

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface QuickLogModalProps {
  visible: boolean;
  friendName: string;
  onClose: () => void;
  onSave: (note: string, date: Date) => void;
}

const QUICK_NOTES = [
  'Had a great call',
  'Met for coffee',
  'Quick catch-up',
  'Texted briefly',
  'Video call',
];

export default function QuickLogModal({
  visible,
  friendName,
  onClose,
  onSave,
}: QuickLogModalProps) {
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const saveScale = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  // Animate content when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
      contentFade.setValue(0);
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSave = async () => {
    const finalNote = note.trim() || 'Contacted';
    setIsSaving(true);
    await onSave(finalNote, selectedDate);
    setNote('');
    setSelectedDate(new Date());
    setIsSaving(false);
  };

  const handleQuickNote = (quickNote: string) => {
    setNote(quickNote);
  };

  const handleClose = () => {
    setNote('');
    setSelectedDate(new Date());
    onClose();
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.container}>
                <Animated.View style={{ opacity: contentFade }}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.handle} />
                  <Text style={styles.title}>Log Interaction</Text>
                  <Text style={styles.subtitle}>with {friendName}</Text>
                </View>

                {/* Date selector */}
                <View style={styles.dateSelector}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setSelectedDate(subDays(selectedDate, 1))}
                  >
                    <Text style={styles.dateButtonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.dateDisplay}>
                    <Text style={styles.dateText}>
                      {isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.dateButton, isToday && styles.dateButtonDisabled]}
                    onPress={() => !isToday && setSelectedDate(addDays(selectedDate, 1))}
                    disabled={isToday}
                  >
                    <Text style={[styles.dateButtonText, isToday && styles.dateButtonTextDisabled]}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick notes */}
                <View style={styles.quickNotes}>
                  {QUICK_NOTES.map((quickNote) => (
                    <TouchableOpacity
                      key={quickNote}
                      style={[
                        styles.quickNoteButton,
                        note === quickNote && styles.quickNoteButtonSelected,
                      ]}
                      onPress={() => handleQuickNote(quickNote)}
                    >
                      <Text
                        style={[
                          styles.quickNoteText,
                          note === quickNote && styles.quickNoteTextSelected,
                        ]}
                      >
                        {quickNote}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom note input */}
                <TextInput
                  style={styles.input}
                  placeholder="Or write your own note..."
                  placeholderTextColor={colors.textLight}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <Animated.View style={{ flex: 2, transform: [{ scale: saveScale }] }}>
                    <TouchableOpacity
                      style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                      onPress={handleSave}
                      onPressIn={() => {
                        Animated.spring(saveScale, {
                          toValue: 0.95,
                          tension: 100,
                          friction: 8,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPressOut={() => {
                        Animated.spring(saveScale, {
                          toValue: 1,
                          tension: 100,
                          friction: 8,
                          useNativeDriver: true,
                        }).start();
                      }}
                      activeOpacity={1}
                      disabled={isSaving}
                    >
                      <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
                </Animated.View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonDisabled: {
    opacity: 0.4,
  },
  dateButtonText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  dateButtonTextDisabled: {
    color: colors.textLight,
  },
  dateDisplay: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    minWidth: 140,
    alignItems: 'center',
  },
  dateText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.primaryDark,
  },
  quickNotes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickNoteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickNoteButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickNoteText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  quickNoteTextSelected: {
    color: colors.card,
    fontWeight: typography.weights.medium,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
});
