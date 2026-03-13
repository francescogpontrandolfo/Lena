// Settings Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { FriendTier, TIER_LABELS, TIER_ORDER, FREQUENCY_OPTIONS } from '../types';
import {
  requestNotificationPermission,
} from '../services/notifications';

const REMINDER_TIME_OPTIONS = [
  { value: '08:00', label: '8 AM' },
  { value: '09:00', label: '9 AM' },
  { value: '10:00', label: '10 AM' },
  { value: '12:00', label: '12 PM' },
  { value: '14:00', label: '2 PM' },
  { value: '18:00', label: '6 PM' },
];

export default function SettingsScreen() {
  const { settings, updateSettings } = useStore();
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      setIsCheckingPermission(true);
      const granted = await requestNotificationPermission();
      setIsCheckingPermission(false);

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    await updateSettings({ notificationsEnabled: value });
  };

  const handleCheckInToggle = async (value: boolean) => {
    await updateSettings({ checkInReminderEnabled: value });
  };

  const handleTierFrequencyChange = async (tier: FriendTier, value: number) => {
    const current = useStore.getState().settings.tierFrequencies;
    await updateSettings({
      tierFrequencies: { ...current, [tier]: value },
    });
  };

  const handleReminderTimeChange = async (value: string) => {
    await updateSettings({ dailyReminderTime: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Notifications section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders for birthdays and check-ins
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primaryMid }}
              thumbColor={settings.notificationsEnabled ? colors.primary : colors.textLight}
              disabled={isCheckingPermission}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Check-in Reminders</Text>
              <Text style={styles.settingDescription}>
                Get reminded to reach out to friends you haven't contacted
              </Text>
            </View>
            <Switch
              value={settings.checkInReminderEnabled}
              onValueChange={handleCheckInToggle}
              trackColor={{ false: colors.border, true: colors.primaryMid }}
              thumbColor={settings.checkInReminderEnabled ? colors.primary : colors.textLight}
            />
          </View>

          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>Daily Reminder Time</Text>
            <Text style={styles.settingDescription}>
              When to send check-in reminders each day
            </Text>
            <View style={styles.frequencyOptions}>
              {REMINDER_TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyButton,
                    settings.dailyReminderTime === option.value &&
                      styles.frequencyButtonSelected,
                  ]}
                  onPress={() => handleReminderTimeChange(option.value)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      settings.dailyReminderTime === option.value &&
                        styles.frequencyTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact frequency per tier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Frequency</Text>

          {TIER_ORDER.map((tier) => (
            <View key={tier} style={styles.settingBlock}>
              <Text style={styles.settingLabel}>{TIER_LABELS[tier]}</Text>
              <View style={styles.frequencyOptions}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyButton,
                      settings.tierFrequencies[tier] === option.value &&
                        styles.frequencyButtonSelected,
                    ]}
                    onPress={() => handleTierFrequencyChange(tier, option.value)}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        settings.tierFrequencies[tier] === option.value &&
                          styles.frequencyTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutCard}>
            <Text style={styles.appName}>Lena</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your personal friend relationship manager. Never forget a birthday
              or lose touch with the people who matter.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with love for better friendships</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100, // Extra padding for absolute tab bar
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingBlock: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  frequencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  frequencyTextSelected: {
    color: colors.card,
    fontWeight: typography.weights.medium,
  },
  aboutCard: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  appName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  appDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
});
