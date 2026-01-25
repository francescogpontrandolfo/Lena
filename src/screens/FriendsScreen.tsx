// Friends Screen - List of all friends with filters

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { Friend, RelationshipType, FriendTier, RELATIONSHIP_LABELS, TIER_LABELS } from '../types';
import { RootStackParamList } from '../navigation';
import FriendCard from '../components/FriendCard';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import FilterModal from '../components/FilterModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FilterState {
  city: string | null;
  relationshipTypes: RelationshipType[];
  tiers: FriendTier[];
}

type FilterModalType = 'city' | 'relationship' | 'tier' | null;

export default function FriendsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { friends, isLoading, loadFriends } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<FilterModalType>(null);
  const [filters, setFilters] = useState<FilterState>({
    city: null,
    relationshipTypes: [],
    tiers: [],
  });

  // Get unique cities from friends
  const cityOptions = useMemo(() => {
    const cities: Record<string, number> = {};
    friends.forEach(friend => {
      if (friend.city) {
        cities[friend.city] = (cities[friend.city] || 0) + 1;
      }
    });
    return Object.entries(cities)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [friends]);

  // Get relationship type options with counts
  const relationshipOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    friends.forEach(friend => {
      counts[friend.relationshipType] = (counts[friend.relationshipType] || 0) + 1;
    });
    return (Object.keys(RELATIONSHIP_LABELS) as RelationshipType[])
      .filter(type => counts[type])
      .map(type => ({
        value: type,
        label: RELATIONSHIP_LABELS[type],
        count: counts[type] || 0,
      }));
  }, [friends]);

  // Get tier options with counts
  const tierOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    friends.forEach(friend => {
      counts[friend.tier] = (counts[friend.tier] || 0) + 1;
    });
    return (Object.keys(TIER_LABELS) as FriendTier[])
      .filter(tier => counts[tier])
      .map(tier => ({
        value: tier,
        label: TIER_LABELS[tier],
        count: counts[tier] || 0,
      }));
  }, [friends]);

  // Apply filters
  const filteredFriends = useMemo(() => {
    return friends.filter(friend => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          friend.name.toLowerCase().includes(query) ||
          friend.city?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // City filter
      if (filters.city && friend.city !== filters.city) return false;

      // Relationship type filter
      if (filters.relationshipTypes.length > 0 &&
          !filters.relationshipTypes.includes(friend.relationshipType)) {
        return false;
      }

      // Tier filter
      if (filters.tiers.length > 0 && !filters.tiers.includes(friend.tier)) {
        return false;
      }

      return true;
    });
  }, [friends, searchQuery, filters]);

  const hasActiveFilters = filters.city || filters.relationshipTypes.length > 0 || filters.tiers.length > 0;

  const clearAllFilters = () => {
    setFilters({ city: null, relationshipTypes: [], tiers: [] });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleFriendPress = (friend: Friend) => {
    navigation.navigate('FriendDetail', { friendId: friend.id });
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <FriendCard friend={item} onPress={() => handleFriendPress(item)} />
  );

  const getCityLabel = () => {
    if (filters.city) return filters.city;
    return 'City';
  };

  const getRelationshipLabel = () => {
    if (filters.relationshipTypes.length === 1) {
      return RELATIONSHIP_LABELS[filters.relationshipTypes[0]];
    }
    if (filters.relationshipTypes.length > 1) {
      return `${filters.relationshipTypes.length} types`;
    }
    return 'Type';
  };

  const getTierLabel = () => {
    if (filters.tiers.length === 1) {
      return TIER_LABELS[filters.tiers[0]];
    }
    if (filters.tiers.length > 1) {
      return `${filters.tiers.length} tiers`;
    }
    return 'Tier';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Friends</Text>
          {hasActiveFilters && (
            <Text style={styles.filterCount}>
              Showing {filteredFriends.length} of {friends.length}
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => navigation.navigate('ImportContacts')}
          >
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        <FilterChip
          label="All"
          isActive={!hasActiveFilters}
          onPress={clearAllFilters}
        />
        {cityOptions.length > 0 && (
          <FilterChip
            label={getCityLabel()}
            isActive={!!filters.city}
            showDropdown={!filters.city}
            onPress={() => filters.city ? setFilters({ ...filters, city: null }) : setActiveModal('city')}
          />
        )}
        <FilterChip
          label={getRelationshipLabel()}
          isActive={filters.relationshipTypes.length > 0}
          showDropdown={filters.relationshipTypes.length === 0}
          onPress={() => filters.relationshipTypes.length > 0
            ? setFilters({ ...filters, relationshipTypes: [] })
            : setActiveModal('relationship')
          }
        />
        <FilterChip
          label={getTierLabel()}
          isActive={filters.tiers.length > 0}
          showDropdown={filters.tiers.length === 0}
          onPress={() => filters.tiers.length > 0
            ? setFilters({ ...filters, tiers: [] })
            : setActiveModal('tier')
          }
        />
      </ScrollView>

      {/* Friends list */}
      {friends.length === 0 ? (
        <EmptyState
          iconType="friends"
          title="No friends yet"
          subtitle="Add your first friend or import from your contacts"
          actionLabel="Add Friend"
          onAction={() => navigation.navigate('AddFriend')}
        />
      ) : filteredFriends.length === 0 ? (
        <EmptyState
          iconType="search"
          title="No results"
          subtitle={hasActiveFilters
            ? "Try adjusting your filters"
            : `No friends matching "${searchQuery}"`
          }
          actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
        />
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriend}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Filter Modals */}
      <FilterModal
        visible={activeModal === 'city'}
        title="Filter by City"
        options={cityOptions}
        selectedValues={filters.city ? [filters.city] : []}
        multiSelect={false}
        onSelect={(values) => setFilters({ ...filters, city: values[0] || null })}
        onClose={() => setActiveModal(null)}
      />

      <FilterModal
        visible={activeModal === 'relationship'}
        title="Filter by Type"
        options={relationshipOptions}
        selectedValues={filters.relationshipTypes}
        multiSelect={true}
        onSelect={(values) => setFilters({ ...filters, relationshipTypes: values as RelationshipType[] })}
        onClose={() => setActiveModal(null)}
      />

      <FilterModal
        visible={activeModal === 'tier'}
        title="Filter by Tier"
        options={tierOptions}
        selectedValues={filters.tiers}
        multiSelect={true}
        onSelect={(values) => setFilters({ ...filters, tiers: values as FriendTier[] })}
        onClose={() => setActiveModal(null)}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  filterCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  importButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  importButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.card,
    fontWeight: typography.weights.medium,
    marginTop: -2,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    ...shadows.sm,
  },
  filterBar: {
    maxHeight: 50,
    marginBottom: spacing.sm,
  },
  filterBarContent: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 100, // Extra padding for absolute tab bar
  },
});
