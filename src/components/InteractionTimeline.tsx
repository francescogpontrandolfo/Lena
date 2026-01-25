// Interaction Timeline Component - Visual timeline of friend interactions

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isThisYear } from 'date-fns';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Interaction } from '../types';

interface InteractionTimelineProps {
  interactions: Interaction[];
  onAddPress: () => void;
}

export default function InteractionTimeline({
  interactions,
  onAddPress,
}: InteractionTimelineProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isThisYear(date)) {
      return format(date, 'MMM d');
    }
    return format(date, 'MMM d, yyyy');
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  if (interactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={styles.emptyIcon}>📝</Text>
        </View>
        <Text style={styles.emptyTitle}>No interactions yet</Text>
        <Text style={styles.emptySubtitle}>
          Start tracking your conversations
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonText}>Log First Interaction</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {interactions.map((interaction, index) => {
        const isLast = index === interactions.length - 1;

        return (
          <View key={interaction.id} style={styles.item}>
            {/* Timeline line and dot */}
            <View style={styles.timelineColumn}>
              <View style={styles.dot} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.date}>{formatDate(interaction.timestamp)}</Text>
                <Text style={styles.time}>{formatTime(interaction.timestamp)}</Text>
              </View>
              <View style={styles.noteCard}>
                <Text style={styles.note}>{interaction.note}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.primaryLight,
    marginTop: spacing.xs,
    marginBottom: -spacing.xs,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  date: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  noteCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
  },
  note: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
});
