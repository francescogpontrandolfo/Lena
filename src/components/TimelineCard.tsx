// Timeline Card Component - Liquid Glass Style

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { TimelineItem, RELATIONSHIP_COLORS } from '../types';
import Avatar from './Avatar';

interface TimelineCardProps {
  item: TimelineItem;
  onPress: () => void;
  index?: number;
}

export default function TimelineCard({ item, onPress, index = 0 }: TimelineCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const getCardConfig = () => {
    switch (item.type) {
      case 'birthday_today':
        return { icon: 'gift', color: colors.secondary, tint: 'rgba(196, 149, 108, 0.10)' };
      case 'birthday_upcoming':
        return { icon: 'calendar', color: colors.accent, tint: 'rgba(155, 143, 170, 0.10)' };
      case 'check_in_suggestion':
        return { icon: 'phone', color: colors.primary, tint: 'rgba(217, 133, 59, 0.08)' };
      case 'custom_reminder':
        return { icon: 'edit-3', color: colors.warning, tint: 'rgba(217, 133, 59, 0.10)' };
      default:
        return { icon: 'calendar', color: colors.primary, tint: 'rgba(217, 133, 59, 0.08)' };
    }
  };

  const cardConfig = getCardConfig();

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardConfig.tint }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.iconContainer, { backgroundColor: cardConfig.color + '18' }]}>
          <Feather name={cardConfig.icon as any} size={18} color={cardConfig.color} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          ) : null}
        </View>

        <View style={styles.avatarContainer}>
          <Avatar
            name={item.friend.name}
            photo={item.friend.photo}
            size={38}
            color={RELATIONSHIP_COLORS[item.friend.relationshipType]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...shadows.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginBottom: 1,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  avatarContainer: {
    marginLeft: spacing.md,
  },
});
