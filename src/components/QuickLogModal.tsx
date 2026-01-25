// Quick Log Modal Component

import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { startVoiceRecording, stopVoiceRecording, transcribeAudioWithMistral, cleanupAudioFile } from '../services/voice';
import { Audio } from 'expo-av';

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
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Reset date to today when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
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

  const handleClose = async () => {
    // Clean up recording if active
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    setNote('');
    setSelectedDate(new Date());
    setIsRecording(false);
    setRecording(null);
    onClose();
  };

  const handleVoiceInput = async () => {
    if (isRecording && recording) {
      // Stop recording
      try {
        const audioUri = await stopVoiceRecording(recording);
        setIsRecording(false);
        setRecording(null);

        if (!audioUri) {
          Alert.alert('Error', 'Failed to save recording.');
          return;
        }

        // Show transcribing state
        Alert.alert('Transcribing', 'Processing your audio...');

        // Transcribe with Mistral
        const result = await transcribeAudioWithMistral(audioUri);

        // Clean up audio file
        await cleanupAudioFile(audioUri);

        if (result && result.text) {
          // Append to existing note or replace if empty
          setNote(prev => prev ? `${prev} ${result.text}` : result.text);
        } else {
          Alert.alert('Voice Input', 'Could not transcribe your voice. Please try again.');
        }
      } catch (error) {
        setIsRecording(false);
        setRecording(null);
        Alert.alert('Error', 'Failed to process recording.');
      }
    } else {
      // Start recording
      try {
        const newRecording = await startVoiceRecording();
        if (newRecording) {
          setRecording(newRecording);
          setIsRecording(true);
        } else {
          Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      }
    }
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

                {/* Custom note input with voice button */}
                <View style={styles.inputContainer}>
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
                  <TouchableOpacity
                    style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
                    onPress={handleVoiceInput}
                  >
                    <Feather
                      name={isRecording ? "mic-off" : "mic"}
                      size={20}
                      color={colors.card}
                    />
                  </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingRight: 56, // Make room for voice button
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  voiceButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  voiceButtonActive: {
    backgroundColor: colors.secondary,
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
    flex: 2,
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
