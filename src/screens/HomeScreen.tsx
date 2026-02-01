// Home Screen - Timeline with suggestions

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { TimelineItem } from '../types';
import { RootStackParamList } from '../navigation';
import TimelineCard from '../components/TimelineCard';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { friends, isLoading, loadFriends, getTimelineItems, getBacklogItems } = useStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // Header fade-in
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const timelineItems = getTimelineItems();
  const backlogItems = getBacklogItems();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, [loadFriends]);

  const handleItemPress = (item: TimelineItem) => {
    const isBirthday = item.type === 'birthday_today' || item.type === 'birthday_upcoming';
    navigation.navigate('FriendDetail', { friendId: item.friend.id, isBirthday });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayItems = timelineItems.filter(
    item => item.type === 'birthday_today' || item.type === 'check_in_suggestion'
  );
  const upcomingItems = timelineItems.filter(
    item => item.type === 'birthday_upcoming'
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: headerFade,
          transform: [{ translateY: headerSlide }],
        }]}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Lena</Text>
            <View style={styles.titleAccent} />
          </View>
          {friends.length > 0 && (
            <Text style={styles.statsText}>
              {timelineItems.length > 0
                ? `${timelineItems.length} action${timelineItems.length !== 1 ? 's' : ''} today`
                : 'All caught up!'}
            </Text>
          )}
        </Animated.View>

        {friends.length === 0 ? (
          <EmptyState
            iconType="friends"
            title="No friends yet"
            subtitle="Add your first friend to start tracking your relationships"
            actionLabel="Add Friend"
            onAction={() => navigation.navigate('AddFriend')}
          />
        ) : timelineItems.length === 0 ? (
          <EmptyState
            iconType="success"
            title="All caught up!"
            subtitle="No birthdays or check-ins needed right now"
          />
        ) : (
          <>
            {/* Today section */}
            {todayItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionAccent, { backgroundColor: colors.secondary }]} />
                  <Text style={styles.sectionTitle}>Today</Text>
                </View>
                {todayItems.map((item, index) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    index={index}
                  />
                ))}
              </View>
            )}

            {/* Upcoming section */}
            {upcomingItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                  <Text style={styles.sectionTitle}>This Week</Text>
                </View>
                {upcomingItems.map((item, index) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    index={index}
                  />
                ))}
              </View>
            )}

            {/* Backlog section */}
            {backlogItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
                  <Text style={styles.sectionTitle}>Catch Up</Text>
                </View>
                {backlogItems.map((item, index) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    index={index}
                  />
                ))}
              </View>
            )}
          </>
        )}

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
  greeting: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  titleAccent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  statsText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});
