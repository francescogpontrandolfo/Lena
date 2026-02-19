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
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { Friend } from '../types';
import { scheduleCustomReminder } from '../services/notifications';

interface QuickLogModalProps {
  visible: boolean;
  friendName?: string;
  friendId?: string;
  onClose: () => void;
  onSave: (note: string, date: Date, friendId?: string) => Promise<void> | void;
}

export default function QuickLogModal({
  visible,
  friendName: propFriendName,
  friendId: propFriendId,
  onClose,
  onSave,
}: QuickLogModalProps) {
  const { friends } = useStore();
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | undefined>(propFriendId);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const saveScale = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  // Organize friends: top 5 recent + rest alphabetically
  const organizedFriends = React.useMemo(() => {
    // Get top 5 most recent
    const recentFive = [...friends]
      .filter(f => f.lastContactedAt)
      .sort((a, b) => {
        const dateA = new Date(a.lastContactedAt!);
        const dateB = new Date(b.lastContactedAt!);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    // Get remaining friends, sorted alphabetically
    const recentIds = new Set(recentFive.map(f => f.id));
    const remaining = friends
      .filter(f => !recentIds.has(f.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      recent: recentFive,
      alphabetical: remaining,
    };
  }, [friends]);

  // Filter based on search
  const filteredFriends = React.useMemo(() => {
    if (!searchQuery.trim()) return organizedFriends;

    const query = searchQuery.toLowerCase();
    return {
      recent: organizedFriends.recent.filter(f =>
        f.name.toLowerCase().includes(query)
      ),
      alphabetical: organizedFriends.alphabetical.filter(f =>
        f.name.toLowerCase().includes(query)
      ),
    };
  }, [organizedFriends, searchQuery]);

  const selectedFriend = selectedFriendId
    ? friends.find(f => f.id === selectedFriendId)
    : undefined;

  const friendName = propFriendName || selectedFriend?.name || 'Select a friend';

  // Animate content when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
      setSelectedFriendId(propFriendId);
      setReminderEnabled(false);
      setReminderDate(addDays(new Date(), 7));
      setSearchQuery('');
      contentFade.setValue(0);
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, propFriendId]);

  const handleSave = async () => {
    if (!propFriendId && !selectedFriendId) {
      return; // Can't save without a friend selected
    }
    const finalNote = note.trim() || 'Contacted';
    setIsSaving(true);

    // Get the friend object for reminder
    const friendForReminder = propFriendId
      ? friends.find(f => f.id === propFriendId)
      : selectedFriend;

    // Save interaction
    await onSave(finalNote, selectedDate, selectedFriendId);

    // Schedule reminder if enabled
    if (reminderEnabled && friendForReminder) {
      await scheduleCustomReminder(
        friendForReminder,
        `Time to reach out to ${friendForReminder.name}!`,
        reminderDate
      );
    }

    // Reset form and close
    setNote('');
    setSelectedDate(new Date());
    setSelectedFriendId(undefined);
    setReminderEnabled(false);
    setReminderDate(addDays(new Date(), 7));
    setSearchQuery('');
    setIsSaving(false);
    onClose();
  };

  const handleClose = () => {
    setNote('');
    setSelectedDate(new Date());
    setSelectedFriendId(undefined);
    setShowFriendSelector(false);
    setReminderEnabled(false);
    setReminderDate(addDays(new Date(), 7));
    setSearchQuery('');
    onClose();
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriendId(friend.id);
    setShowFriendSelector(false);
    setSearchQuery('');
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const handleDateChange = (event: any, date?: Date) => {
    // For Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date && event.type !== 'dismissed') {
        setSelectedDate(date);
      }
    } else {
      // For iOS, update date immediately as user scrolls
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleReminderDateChange = (event: any, date?: Date) => {
    // For Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowReminderPicker(false);
      if (date && event.type !== 'dismissed') {
        setReminderDate(date);
      }
    } else {
      // For iOS, update date immediately as user scrolls
      if (date) {
        setReminderDate(date);
      }
    }
  };

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
                  {!propFriendId && !propFriendName ? (
                    <TouchableOpacity
                      style={styles.friendSelectorButton}
                      onPress={() => setShowFriendSelector(!showFriendSelector)}
                    >
                      <Text style={[
                        styles.friendSelectorText,
                        !selectedFriend && styles.friendSelectorTextPlaceholder
                      ]}>
                        {friendName}
                      </Text>
                      <Feather
                        name={showFriendSelector ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.subtitle}>with {friendName}</Text>
                  )}
                </View>

                {/* Friend Selector Dropdown */}
                {showFriendSelector && !propFriendId && (
                  <View style={styles.friendSelector}>
                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                      <Feather name="search" size={16} color={colors.textSecondary} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search friends..."
                        placeholderTextColor={colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <Feather name="x" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <ScrollView style={styles.friendList} nestedScrollEnabled>
                      {/* Recent Friends Section */}
                      {filteredFriends.recent.length > 0 && (
                        <>
                          <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>RECENT</Text>
                          </View>
                          {filteredFriends.recent.map((friend) => (
                            <TouchableOpacity
                              key={friend.id}
                              style={styles.friendItem}
                              onPress={() => handleSelectFriend(friend)}
                            >
                              <Text style={styles.friendItemName}>{friend.name}</Text>
                              {friend.lastContactedAt && (
                                <Text style={styles.friendItemDate}>
                                  Last: {format(new Date(friend.lastContactedAt), 'MMM d')}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </>
                      )}

                      {/* All Friends Section */}
                      {filteredFriends.alphabetical.length > 0 && (
                        <>
                          <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>ALL FRIENDS</Text>
                          </View>
                          {filteredFriends.alphabetical.map((friend) => (
                            <TouchableOpacity
                              key={friend.id}
                              style={styles.friendItem}
                              onPress={() => handleSelectFriend(friend)}
                            >
                              <Text style={styles.friendItemName}>{friend.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </>
                      )}

                      {filteredFriends.recent.length === 0 && filteredFriends.alphabetical.length === 0 && (
                        <Text style={styles.emptyText}>
                          {searchQuery ? 'No friends found' : 'No friends added yet'}
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Date selector with calendar icon */}
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Feather name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.dateText}>
                    {isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Date Picker */}
                {showDatePicker && (
                  <>
                    {Platform.OS === 'ios' && (
                      <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.datePickerDone}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="spinner"
                          maximumDate={new Date()}
                          onChange={handleDateChange}
                          themeVariant="light"
                          style={styles.datePicker}
                        />
                      </View>
                    )}
                    {Platform.OS === 'android' && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={handleDateChange}
                      />
                    )}
                  </>
                )}

                {/* Reminder Toggle */}
                <View style={styles.reminderSection}>
                  <TouchableOpacity
                    style={styles.reminderToggle}
                    onPress={() => setReminderEnabled(!reminderEnabled)}
                  >
                    <Feather
                      name={reminderEnabled ? 'check-square' : 'square'}
                      size={20}
                      color={reminderEnabled ? colors.primary : colors.textSecondary}
                    />
                    <Text style={styles.reminderToggleText}>Set reminder to follow up</Text>
                  </TouchableOpacity>

                  {reminderEnabled && (
                    <TouchableOpacity
                      style={styles.reminderDateButton}
                      onPress={() => setShowReminderPicker(true)}
                    >
                      <Feather name="bell" size={18} color={colors.primary} />
                      <Text style={styles.reminderDateText}>
                        Remind me: {format(reminderDate, 'MMM d, yyyy')}
                      </Text>
                      <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Reminder Date Picker */}
                {showReminderPicker && (
                  <>
                    {Platform.OS === 'ios' && (
                      <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity onPress={() => setShowReminderPicker(false)}>
                            <Text style={styles.datePickerDone}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={reminderDate}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          onChange={handleReminderDateChange}
                          themeVariant="light"
                          style={styles.datePicker}
                        />
                      </View>
                    )}
                    {Platform.OS === 'android' && (
                      <DateTimePicker
                        value={reminderDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={handleReminderDateChange}
                      />
                    )}
                  </>
                )}

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
                      style={[
                        styles.saveButton,
                        (isSaving || (!propFriendId && !selectedFriendId)) && styles.saveButtonDisabled
                      ]}
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
                      disabled={isSaving || (!propFriendId && !selectedFriendId)}
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
  friendSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  friendSelectorText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    flex: 1,
  },
  friendSelectorTextPlaceholder: {
    color: colors.textSecondary,
  },
  friendSelector: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    maxHeight: 280,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    padding: 0,
  },
  friendList: {
    maxHeight: 220,
  },
  sectionHeader: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendItemName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  friendItemDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  datePickerContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerDone: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  datePicker: {
    width: '100%',
  },
  reminderSection: {
    marginBottom: spacing.lg,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reminderToggleText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  reminderDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginLeft: spacing.xl,
  },
  reminderDateText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
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
