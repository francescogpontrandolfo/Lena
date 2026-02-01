// Friends Screen - Tier-based organization

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { Friend, FriendTier, TIER_LABELS, TIER_COLORS } from '../types';
import { RootStackParamList } from '../navigation';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ACTIVE_TIERS: FriendTier[] = ['top', 'close', 'cordialities'];

function AnimatedFriendRow({ friend, onPress }: { friend: Friend; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.friendRow}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {friend.photo ? (
          <Image source={{ uri: friend.photo }} style={styles.friendAvatar} />
        ) : (
          <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
            <Text style={styles.friendAvatarText}>
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.name}</Text>
          {friend.city && (
            <Text style={styles.friendDetail}>{friend.city}</Text>
          )}
        </View>
        {friend.isStarred && (
          <Text style={styles.starIcon}>⭐</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FriendsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { friends, isLoading, loadFriends } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedTiers, setCollapsedTiers] = useState<Set<FriendTier>>(new Set());

  // Group friends by tier (only active tiers, exclude 'other')
  const friendsByTier = useMemo(() => {
    const grouped: Record<FriendTier, Friend[]> = {
      top: [],
      close: [],
      cordialities: [],
      other: [],
    };

    friends.forEach(friend => {
      grouped[friend.tier].push(friend);
    });

    // Sort friends within each tier by name
    Object.keys(grouped).forEach(tier => {
      grouped[tier as FriendTier].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [friends]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const toggleTier = (tier: FriendTier) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      250,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity,
    ));
    const newCollapsed = new Set(collapsedTiers);
    if (newCollapsed.has(tier)) {
      newCollapsed.delete(tier);
    } else {
      newCollapsed.add(tier);
    }
    setCollapsedTiers(newCollapsed);
  };

  const handleFriendPress = (friend: Friend) => {
    navigation.navigate('FriendDetail', { friendId: friend.id });
  };

  const handleAddToTier = (tier: FriendTier) => {
    // Navigate to ImportContacts screen with tier pre-selected
    // For now, just navigate to ImportContacts
    navigation.navigate('ImportContacts');
  };

  const renderFriendRow = (friend: Friend) => (
    <AnimatedFriendRow
      key={friend.id}
      friend={friend}
      onPress={() => handleFriendPress(friend)}
    />
  );

  const renderTierSection = (tier: FriendTier) => {
    const tierFriends = friendsByTier[tier];
    const isCollapsed = collapsedTiers.has(tier);
    const count = tierFriends.length;

    return (
      <View key={tier} style={styles.tierSection}>
        {/* Tier Header */}
        <TouchableOpacity
          style={styles.tierHeader}
          onPress={() => toggleTier(tier)}
          activeOpacity={0.7}
        >
          <View style={styles.tierHeaderLeft}>
            <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[tier] }]}>
              <Text style={styles.tierBadgeText}>{count}</Text>
            </View>
            <Text style={styles.tierTitle}>{TIER_LABELS[tier]}</Text>
          </View>
          <View style={styles.tierHeaderRight}>
            <TouchableOpacity
              style={styles.addToTierButton}
              onPress={() => handleAddToTier(tier)}
              onPressIn={(e) => e.stopPropagation()}
            >
              <Text style={styles.addToTierButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.collapseIcon}>
              {isCollapsed ? '▶' : '▼'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Tier Content */}
        {!isCollapsed && (
          <View style={styles.tierContent}>
            {count === 0 ? (
              <View style={styles.emptyTier}>
                <Text style={styles.emptyTierText}>
                  No friends in this tier yet
                </Text>
                <TouchableOpacity
                  style={styles.emptyTierButton}
                  onPress={() => handleAddToTier(tier)}
                >
                  <Text style={styles.emptyTierButtonText}>
                    Add friends to {TIER_LABELS[tier].toLowerCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              tierFriends.map(friend => renderFriendRow(friend))
            )}
          </View>
        )}
      </View>
    );
  };

  const activeFriends = ACTIVE_TIERS.reduce((sum, tier) => sum + friendsByTier[tier].length, 0);

  if (friends.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
        </View>
        <EmptyState
          iconType="friends"
          title="No friends yet"
          subtitle="Import your contacts to get started"
          actionLabel="Import Contacts"
          onAction={() => navigation.navigate('ImportContacts')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Friends</Text>
          <Text style={styles.subtitle}>
            {activeFriends} in active tiers
          </Text>
        </View>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate('ImportContacts')}
        >
          <Text style={styles.manageButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Tier Sections */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {ACTIVE_TIERS.map(tier => renderTierSection(tier))}

        {/* Info footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Friends in the "Other" tier ({friendsByTier.other.length}) receive birthday reminders only.
          </Text>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => navigation.navigate('ImportContacts')}
          >
            <Text style={styles.footerButtonText}>
              View all contacts
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manageButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  manageButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  tierSection: {
    marginBottom: spacing.lg,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  tierHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tierBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.card,
  },
  tierTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  tierHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addToTierButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToTierButtonText: {
    fontSize: 20,
    color: colors.card,
    fontWeight: typography.weights.medium,
    marginTop: -2,
  },
  collapseIcon: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    width: 20,
    textAlign: 'center',
  },
  tierContent: {
    marginTop: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  emptyTier: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTierText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyTierButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  emptyTierButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primaryDark,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
  },
  friendAvatarPlaceholder: {
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  friendDetail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  starIcon: {
    fontSize: 16,
  },
  footer: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  footerButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  footerButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primaryDark,
  },
});
