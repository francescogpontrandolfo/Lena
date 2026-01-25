// Timeline Card Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { TimelineItem, RELATIONSHIP_COLORS } from '../types';

interface TimelineCardProps {
  item: TimelineItem;
  onPress: () => void;
}

export default function TimelineCard({ item, onPress }: TimelineCardProps) {
  const getIconConfig = () => {
    switch (item.type) {
      case 'birthday_today':
        return { icon: 'gift', color: colors.secondaryDark, bgColor: colors.secondaryLight };
      case 'birthday_upcoming':
        return { icon: 'calendar', color: colors.accentDark, bgColor: colors.accentLight };
      case 'check_in_suggestion':
        return { icon: 'phone', color: colors.primaryDark, bgColor: colors.primaryLight };
      case 'custom_reminder':
        return { icon: 'edit-3', color: '#B8860B', bgColor: colors.warning };
      default:
        return { icon: 'calendar', color: colors.primaryDark, bgColor: colors.primaryLight };
    }
  };

  const getAccentColor = () => {
    switch (item.type) {
      case 'birthday_today':
        return colors.secondary;
      case 'birthday_upcoming':
        return colors.accent;
      case 'check_in_suggestion':
        return colors.primary;
      case 'custom_reminder':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const accentColor = getAccentColor();
  const iconConfig = getIconConfig();

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
        <Feather name={iconConfig.icon as any} size={20} color={iconConfig.color} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      <View style={styles.avatarContainer}>
        {item.friend.photo ? (
          <Image source={{ uri: item.friend.photo }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: RELATIONSHIP_COLORS[item.friend.relationshipType] },
            ]}
          >
            <Text style={styles.avatarText}>
              {item.friend.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
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
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  avatarContainer: {
    marginLeft: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});
