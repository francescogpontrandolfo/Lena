// Swipeable Timeline Card - Hinge-like swipe gestures
// Swipe right = done (log contact), Swipe left = snooze (restart clock)

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { TimelineItem } from '../types';
import TimelineCard from './TimelineCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 0.5;
const FLY_OFF_DURATION = 300;
const COLLAPSE_DURATION = 250;

interface SwipeableTimelineCardProps {
  item: TimelineItem;
  onPress: () => void;
  onSwipeRight: (item: TimelineItem) => void;
  onSwipeLeft: (item: TimelineItem) => void;
  index?: number;
}

export default function SwipeableTimelineCard({
  item,
  onPress,
  onSwipeRight,
  onSwipeLeft,
  index = 0,
}: SwipeableTimelineCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const containerHeight = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const measuredHeight = useRef(0);
  const heightInitialized = useRef(false);
  const isSwiping = useRef(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    if (!heightInitialized.current && height > 0) {
      measuredHeight.current = height;
      containerHeight.setValue(height);
      heightInitialized.current = true;
    }
  }, []);

  const springBack = useCallback(() => {
    isSwiping.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const flyOffAndCollapse = useCallback(
    (direction: 'left' | 'right') => {
      const toValue = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

      Animated.timing(translateX, {
        toValue,
        duration: FLY_OFF_DURATION,
        useNativeDriver: true,
      }).start(() => {
        // Collapse the card height
        Animated.parallel([
          Animated.timing(containerHeight, {
            toValue: 0,
            duration: COLLAPSE_DURATION,
            useNativeDriver: false,
          }),
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: COLLAPSE_DURATION * 0.6,
            useNativeDriver: false,
          }),
        ]).start(() => {
          if (direction === 'right') {
            onSwipeRight(item);
          } else {
            onSwipeLeft(item);
          }
        });
      });
    },
    [translateX, containerHeight, containerOpacity, item, onSwipeRight, onSwipeLeft],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 10;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        if (Math.abs(dx) >= SWIPE_THRESHOLD || Math.abs(vx) >= VELOCITY_THRESHOLD) {
          flyOffAndCollapse(dx > 0 ? 'right' : 'left');
        } else {
          springBack();
        }
      },
      onPanResponderTerminate: () => {
        springBack();
      },
      onPanResponderTerminationRequest: () => !isSwiping.current,
    }),
  ).current;

  // Interpolations for the card transform
  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  // Right swipe action (done) - revealed on left side
  const rightActionScale = translateX.interpolate({
    inputRange: [0, 40, SWIPE_THRESHOLD],
    outputRange: [0.4, 0.7, 1],
    extrapolate: 'clamp',
  });

  const rightActionOpacity = translateX.interpolate({
    inputRange: [0, 30, 80],
    outputRange: [0, 0.4, 1],
    extrapolate: 'clamp',
  });

  // Left swipe action (snooze) - revealed on right side
  const leftActionScale = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -40, 0],
    outputRange: [1, 0.7, 0.4],
    extrapolate: 'clamp',
  });

  const leftActionOpacity = translateX.interpolate({
    inputRange: [-80, -30, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.outerWrapper,
        {
          height: heightInitialized.current ? containerHeight : undefined,
          opacity: containerOpacity,
        },
      ]}
      onLayout={onLayout}
    >
      {/* Action backgrounds */}
      <View style={styles.actionsContainer}>
        {/* Right swipe action background (Done) - shown on left */}
        <Animated.View style={[styles.actionBackground, styles.actionLeft, { opacity: rightActionOpacity }]}>
          <Animated.View
            style={[
              styles.actionContent,
              {
                transform: [{ scale: rightActionScale }],
              },
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.success }]}>
              <Feather name="check" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.success }]}>Done</Text>
          </Animated.View>
        </Animated.View>

        {/* Left swipe action background (Snooze) - shown on right */}
        <Animated.View style={[styles.actionBackground, styles.actionRight, { opacity: leftActionOpacity }]}>
          <Animated.View
            style={[
              styles.actionContent,
              {
                transform: [{ scale: leftActionScale }],
              },
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primary }]}>
              <Feather name="clock" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>Snooze</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={{
          transform: [{ translateX }, { rotate }],
        }}
        {...panResponder.panHandlers}
      >
        <TimelineCard item={item} onPress={onPress} index={index} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    overflow: 'hidden',
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  actionBackground: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  actionLeft: {
    alignItems: 'flex-start',
    paddingLeft: spacing.lg,
    backgroundColor: '#E8F5EC',
  },
  actionRight: {
    alignItems: 'flex-end',
    paddingRight: spacing.lg,
    backgroundColor: '#FFF3E0',
  },
  actionContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
