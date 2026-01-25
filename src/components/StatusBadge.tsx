// Status Badge Component - Shows contact urgency status

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

export type StatusType = 'overdue' | 'soon' | 'recent' | 'birthday' | 'new';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<StatusType, { label: string; icon: string; bgColor: string; textColor: string }> = {
  overdue: {
    label: 'Overdue',
    icon: 'alert-circle',
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
  },
  soon: {
    label: 'Due soon',
    icon: 'calendar',
    bgColor: '#FEF3C7',
    textColor: '#D97706',
  },
  recent: {
    label: 'Recent',
    icon: 'check-circle',
    bgColor: '#D1FAE5',
    textColor: '#059669',
  },
  birthday: {
    label: 'Birthday!',
    icon: 'gift',
    bgColor: '#FCE7F3',
    textColor: '#DB2777',
  },
  new: {
    label: 'New friend',
    icon: 'user-plus',
    bgColor: '#E0E7FF',
    textColor: '#4F46E5',
  },
};

export function getContactStatus(
  lastContactedAt: string | undefined,
  contactFrequencyDays: number,
  isBirthday: boolean = false
): StatusType {
  if (isBirthday) return 'birthday';
  if (!lastContactedAt) return 'new';

  const daysSince = Math.floor(
    (new Date().getTime() - new Date(lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince >= contactFrequencyDays) return 'overdue';
  if (daysSince >= contactFrequencyDays - 3) return 'soon';
  return 'recent';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.bgColor },
      isSmall && styles.badgeSmall,
    ]}>
      <Feather
        name={config.icon as any}
        size={isSmall ? 12 : 14}
        color={config.textColor}
      />
      <Text style={[
        styles.label,
        { color: config.textColor },
        isSmall && styles.labelSmall,
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  labelSmall: {
    fontSize: typography.sizes.xs,
  },
});
