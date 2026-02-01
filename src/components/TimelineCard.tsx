// Timeline Card Component

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { TimelineItem, RELATIONSHIP_COLORS } from '../types';

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
      toValue: 0.96,
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
  const getIconConfig = () => {
    switch (item.type) {
      case 'birthday_today':
        return { icon: 'gift', color: '#FFFFFF', bgColor: colors.secondary };
      case 'birthday_upcoming':
        return { icon: 'calendar', color: '#FFFFFF', bgColor: colors.accent };
      case 'check_in_suggestion':
        return { icon: 'phone', color: '#FFFFFF', bgColor: colors.primary };
      case 'custom_reminder':
        return { icon: 'edit-3', color: '#FFFFFF', bgColor: colors.warning };
      default:
        return { icon: 'calendar', color: '#FFFFFF', bgColor: colors.primary };
    }
  };

  const getGradientColors = () => {
    switch (item.type) {
      case 'birthday_today':
        // Warm pink gradient
        return ['#FFF0F5', '#FFE4EC', '#FFD6E8'];
      case 'birthday_upcoming':
        // Soft indigo/lavender gradient
        return ['#F0F0FF', '#E8E8FF', '#DDDCFE'];
      case 'check_in_suggestion':
        // Electric blue gradient
        return ['#E8F4FD', '#D6ECFF', '#C4E4FF'];
      case 'custom_reminder':
        // Warm amber gradient
        return ['#FFF8E1', '#FFF0C2', '#FFE8A3'];
      default:
        return ['#E8F4FD', '#D6ECFF', '#C4E4FF'];
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

  const gradientColors = getGradientColors();
  const accentColor = getAccentColor();
  const iconConfig = getIconConfig();

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
      <TouchableOpacity
        style={[styles.containerWrapper, { borderLeftColor: accentColor }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.container}>
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
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gradient: {
    borderRadius: borderRadius.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
    color: '#FFFFFF',
  },
});
