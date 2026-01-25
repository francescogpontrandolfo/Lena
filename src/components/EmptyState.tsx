// Empty State Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

type IconType = 'friends' | 'search' | 'success' | 'calendar' | 'notification';

interface EmptyStateProps {
  iconType: IconType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ICON_CONFIG: Record<IconType, { icon: string; color: string; bgColor: string }> = {
  friends: { icon: 'user-plus', color: colors.primaryDark, bgColor: colors.primaryLight },
  search: { icon: 'search', color: colors.textSecondary, bgColor: colors.border },
  success: { icon: 'check-circle', color: colors.accentDark, bgColor: colors.accentLight },
  calendar: { icon: 'calendar', color: colors.secondaryDark, bgColor: colors.secondaryLight },
  notification: { icon: 'alert-circle', color: colors.primaryDark, bgColor: colors.primaryLight },
};

export default function EmptyState({
  iconType,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = ICON_CONFIG[iconType];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Feather name={config.icon as any} size={48} color={config.color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
});
