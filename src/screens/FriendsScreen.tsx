// Friends Screen - Tier-based organization

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { Friend, FriendTier, TIER_LABELS, TIER_COLORS } from '../types';
import { RootStackParamList } from '../navigation';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ACTIVE_TIERS: FriendTier[] = ['top', 'close', 'cordialities', 'other'];

type FriendRow = Friend[];

interface TierSection {
  tier: FriendTier;
  data: FriendRow[];
}

function needsContact(friend: Friend): boolean {
  if (!friend.lastContactedAt) return false;
  const daysSince = Math.floor(
    (Date.now() - new Date(friend.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSince >= friend.contactFrequencyDays;
}

const GridFriendItem = React.memo(function GridFriendItem({
  friend,
  onPress,
}: { friend: Friend; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overdue = needsContact(friend);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.93, tension: 100, friction: 8, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.gridCell, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.gridCellInner}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.gridAvatarWrapper}>
          <Avatar name={friend.name} photo={friend.photo} size={64} />
          {overdue && <View style={styles.attentionDot} />}
        </View>
        <Text style={styles.gridName} numberOfLines={1}>
          {friend.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Modal to pick a friend from all friends not already in the target tier
function TierFriendPickerModal({
  visible,
  targetTier,
  allFriends,
  onSelect,
  onClose,
}: {
  visible: boolean;
  targetTier: FriendTier | null;
  allFriends: Friend[];
  onSelect: (friend: Friend) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const eligible = useMemo(() => {
    const base = allFriends.filter(f => f.tier !== targetTier);
    if (!search.trim()) return base.sort((a, b) => a.name.localeCompare(b.name));
    const q = search.toLowerCase();
    return base
      .filter(f => f.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allFriends, targetTier, search]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (friend: Friend) => {
    setSearch('');
    onSelect(friend);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={pickerStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={pickerStyles.container}>
              <View style={pickerStyles.header}>
                <Text style={pickerStyles.title}>
                  Move to {targetTier ? TIER_LABELS[targetTier] : ''}
                </Text>
                <TouchableOpacity onPress={handleClose} style={pickerStyles.closeButton}>
                  <Feather name="x" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={pickerStyles.searchRow}>
                <Feather name="search" size={16} color={colors.textSecondary} style={pickerStyles.searchIcon} />
                <TextInput
                  style={pickerStyles.searchInput}
                  placeholder="Search friends..."
                  placeholderTextColor={colors.textSecondary}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Feather name="x-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Friend list - virtualized */}
              <FlatList
                data={eligible}
                keyExtractor={(item) => item.id}
                style={pickerStyles.list}
                contentContainerStyle={{ paddingBottom: spacing.md }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={15}
                maxToRenderPerBatch={20}
                windowSize={5}
                ListEmptyComponent={
                  <View style={pickerStyles.emptyRow}>
                    <Text style={pickerStyles.emptyText}>
                      {search.trim() ? 'No friends match your search' : 'All friends are already in this tier'}
                    </Text>
                  </View>
                }
                renderItem={({ item: friend }) => (
                  <TouchableOpacity
                    style={pickerStyles.friendRow}
                    onPress={() => handleSelect(friend)}
                    activeOpacity={0.7}
                  >
                    <View style={pickerStyles.avatarWrapper}>
                      <Avatar name={friend.name} photo={friend.photo} size={44} />
                    </View>
                    <View style={pickerStyles.friendInfo}>
                      <Text style={pickerStyles.friendName}>{friend.name}</Text>
                      <Text style={pickerStyles.friendTier}>
                        Currently in {TIER_LABELS[friend.tier]}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const GRID_COLUMNS = 3;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export default function FriendsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const friends = useStore(state => state.friends);
  const loadFriends = useStore(state => state.loadFriends);
  const updateFriend = useStore(state => state.updateFriend);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedTiers, setCollapsedTiers] = useState<Set<FriendTier>>(new Set(ACTIVE_TIERS));
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerTier, setPickerTier] = useState<FriendTier | null>(null);

  // Group friends by tier and filter by search query
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

    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered: Record<FriendTier, Friend[]> = {
        top: [],
        close: [],
        cordialities: [],
        other: [],
      };

      Object.keys(grouped).forEach(tier => {
        filtered[tier as FriendTier] = grouped[tier as FriendTier].filter(friend =>
          friend.name.toLowerCase().includes(query)
        );
      });

      return filtered;
    }

    return grouped;
  }, [friends, searchQuery]);

  // Build SectionList sections - collapsed tiers get empty data, friends chunked into grid rows
  const sections: TierSection[] = useMemo(() => {
    return ACTIVE_TIERS.map(tier => ({
      tier,
      data: collapsedTiers.has(tier) ? [] : chunkArray(friendsByTier[tier], GRID_COLUMNS),
    }));
  }, [friendsByTier, collapsedTiers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, [loadFriends]);

  const toggleTier = useCallback((tier: FriendTier) => {
    setCollapsedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  }, []);

  const handleFriendPress = useCallback((friendId: string) => {
    navigation.navigate('FriendDetail', { friendId });
  }, [navigation]);

  const handleAddToTier = useCallback((tier: FriendTier) => {
    setPickerTier(tier);
  }, []);

  const handlePickerSelect = useCallback(async (friend: Friend) => {
    if (!pickerTier) return;
    setPickerTier(null);
    await updateFriend(friend.id, { tier: pickerTier });
  }, [pickerTier, updateFriend]);

  const renderSectionHeader = useCallback(({ section }: { section: TierSection }) => {
    const { tier } = section;
    const count = friendsByTier[tier].length;
    const isCollapsed = collapsedTiers.has(tier);

    return (
      <View style={styles.tierSection}>
        <TouchableOpacity
          style={styles.tierHeader}
          onPress={() => toggleTier(tier)}
          activeOpacity={0.7}
        >
          <View style={styles.tierHeaderLeft}>
            {tier !== 'other' && (
              <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[tier] }]}>
                <Text style={styles.tierBadgeText}>{count}</Text>
              </View>
            )}
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
      </View>
    );
  }, [friendsByTier, collapsedTiers, toggleTier, handleAddToTier]);

  const renderSectionFooter = useCallback(({ section }: { section: TierSection }) => {
    const { tier } = section;
    const isCollapsed = collapsedTiers.has(tier);
    const count = friendsByTier[tier].length;

    // Show empty state only when expanded AND no friends
    if (isCollapsed || count > 0) return null;

    return (
      <View style={styles.tierContent}>
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
      </View>
    );
  }, [collapsedTiers, friendsByTier, handleAddToTier]);

  const renderItem = useCallback(({ item, index, section }: { item: FriendRow; index: number; section: TierSection }) => {
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;
    return (
      <View style={[
        styles.gridRow,
        isFirst && styles.gridRowFirst,
        isLast && styles.gridRowLast,
      ]}>
        {item.map(friend => (
          <GridFriendItem
            key={friend.id}
            friend={friend}
            onPress={() => handleFriendPress(friend.id)}
          />
        ))}
        {item.length < GRID_COLUMNS &&
          Array.from({ length: GRID_COLUMNS - item.length }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.gridCell} />
          ))}
      </View>
    );
  }, [handleFriendPress]);

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
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Feather name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tier Sections */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.map(f => f.id).join('-')}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader as any}
        renderSectionFooter={renderSectionFooter as any}
        stickySectionHeadersEnabled={false}
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
      />

      {/* Friend picker modal */}
      <TierFriendPickerModal
        visible={pickerTier !== null}
        targetTier={pickerTier}
        allFriends={friends}
        onSelect={handlePickerSelect}
        onClose={() => setPickerTier(null)}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  tierSection: {
    marginBottom: spacing.xs,
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
  gridRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  gridRowFirst: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gridRowLast: {
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  gridCellInner: {
    alignItems: 'center',
    width: '100%',
  },
  gridAvatarWrapper: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  attentionDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.card,
  },
  gridName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '75%',
    ...shadows.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    paddingVertical: 2,
  },
  list: {
    flex: 1,
  },
  emptyRow: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrapper: {
    marginRight: spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  friendTier: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
