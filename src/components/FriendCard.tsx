// Friend Card Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { differenceInDays } from 'date-fns';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Friend } from '../types';

// Avatar colors - muted tones that work well with white text
const AVATAR_COLORS = [
  '#7C9EB2',  // blue
  '#8E9AAF',  // slate
  '#9B8AA5',  // purple
  '#7BA38C',  // sage
  '#A5927C',  // tan
  '#8FA5A5',  // teal
  '#A58C8C',  // dusty rose
  '#8C8FA5',  // periwinkle
];

// Get consistent color based on name
const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface FriendCardProps {
  friend: Friend;
  onPress: () => void;
}

export default function FriendCard({ friend, onPress }: FriendCardProps) {
  const getDaysSinceContact = () => {
    if (!friend.lastContactedAt) return null;
    return differenceInDays(new Date(), new Date(friend.lastContactedAt));
  };

  const getUpcomingBirthday = () => {
    if (!friend.birthday) return null;

    const birthday = new Date(friend.birthday);
    const today = new Date();
    const thisYear = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );

    if (thisYear < today) {
      thisYear.setFullYear(today.getFullYear() + 1);
    }

    const days = differenceInDays(thisYear, today);
    if (days === 0) return 'Birthday today!';
    if (days === 1) return 'Birthday tomorrow';
    if (days <= 7) return `Birthday in ${days} days`;
    return null;
  };

  const daysSince = getDaysSinceContact();
  const upcomingBirthday = getUpcomingBirthday();
  const needsAttention = daysSince !== null && daysSince >= friend.contactFrequencyDays;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      {friend.photo ? (
        <Image source={{ uri: friend.photo }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: getAvatarColor(friend.name) },
          ]}
        >
          <Text style={styles.avatarText}>
            {friend.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {friend.name}
        </Text>

        {friend.city && (
          <Text style={styles.city} numberOfLines={1}>
            {friend.city}
          </Text>
        )}

        {upcomingBirthday ? (
          <Text style={styles.birthdayBadge}>{upcomingBirthday}</Text>
        ) : daysSince !== null ? (
          <Text style={[styles.lastContact, needsAttention && styles.needsAttention]}>
            {daysSince === 0
              ? 'Contacted today'
              : `${daysSince} days since contact`}
          </Text>
        ) : (
          <Text style={styles.lastContact}>Time to reconnect!</Text>
        )}
      </View>

      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        {needsAttention && <View style={styles.attentionDot} />}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  city: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  lastContact: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  needsAttention: {
    color: colors.error,
  },
  birthdayBadge: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: 24,
    color: colors.textLight,
  },
});
