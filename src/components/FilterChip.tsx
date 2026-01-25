// Filter Chip Component - Reusable filter button with active state

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  showDropdown?: boolean;
}

export default function FilterChip({
  label,
  isActive,
  onPress,
  showDropdown = false,
}: FilterChipProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={[styles.label, isActive && styles.labelActive]}>
          {label}
          {showDropdown && ' ▾'}
        </Text>
        {isActive && (
          <Text style={styles.clearIcon}> ✕</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.card,
  },
  clearIcon: {
    fontSize: typography.sizes.xs,
    color: colors.card,
    marginLeft: 2,
  },
});
