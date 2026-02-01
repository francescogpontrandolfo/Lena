// Import Contacts Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { Friend } from '../types';

export default function ImportContactsScreen() {
  const navigation = useNavigation();
  const { friends, updateFriend, settings } = useStore();

  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setIsLoading(true);
    setPermissionDenied(false);

    // Check current permission status
    const { status: currentStatus } = await Contacts.getPermissionsAsync();

    if (currentStatus === 'granted') {
      setHasPermission(true);
    } else if (currentStatus === 'denied') {
      setHasPermission(false);
      setPermissionDenied(true);
      setIsLoading(false);
      return;
    } else {
      const { status: newStatus } = await Contacts.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        setHasPermission(false);
        setPermissionDenied(newStatus === 'denied');
        setIsLoading(false);
        return;
      }
      setHasPermission(true);
    }

    // Get all friends from contacts
    const contactFriends = friends.filter(f => f.contactId);
    setAllFriends(contactFriends);

    // Pre-select friends in active tiers (not 'other')
    const activeIds = contactFriends
      .filter(f => f.tier !== 'other')
      .map(f => f.id);
    setSelectedIds(new Set(activeIds));

    setIsLoading(false);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredFriends.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFriends.map(f => f.id)));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update all friends based on selection
      for (const friend of allFriends) {
        const isSelected = selectedIds.has(friend.id);
        const isInActiveTier = friend.tier !== 'other';

        // If selection changed, update the friend's tier
        if (isSelected && !isInActiveTier) {
          // Move to 'close' tier and set default contact frequency
          await updateFriend(friend.id, {
            tier: 'close',
            contactFrequencyDays: settings.defaultContactFrequency,
          });
        } else if (!isSelected && isInActiveTier) {
          // Move back to 'other' tier (no active tracking)
          await updateFriend(friend.id, {
            tier: 'other',
          });
        }
      }

      Alert.alert(
        'Success',
        `Updated ${selectedIds.size} friend${selectedIds.size !== 1 ? 's' : ''} for follow-up`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update friends. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFriends = allFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriend = ({ item }: { item: Friend }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.contactRow, isSelected && styles.contactRowSelected]}
        onPress={() => toggleSelection(item.id)}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.phone && (
            <Text style={styles.contactDetail}>{item.phone}</Text>
          )}
          {item.birthday && (
            <Text style={styles.contactDetail}>🎂 Birthday saved</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  const openSettings = () => {
    Linking.openSettings();
  };

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <View style={styles.permissionIconContainer}>
          <Text style={styles.permissionIconText}>Contacts</Text>
        </View>
        <Text style={styles.permissionTitle}>Contacts Access Needed</Text>
        <Text style={styles.permissionText}>
          {permissionDenied
            ? 'You previously denied access. Please enable Contacts access in Settings to import your friends.'
            : 'Please allow access to your contacts to import friends.'}
        </Text>
        {permissionDenied ? (
          <TouchableOpacity style={styles.retryButton} onPress={openSettings}>
            <Text style={styles.retryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.retryButton} onPress={loadFriends}>
            <Text style={styles.retryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (allFriends.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIconText}>📱</Text>
        </View>
        <Text style={styles.emptyTitle}>No contacts yet</Text>
        <Text style={styles.emptyText}>
          Your contacts will automatically sync when you add them to your phone.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Header text */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Select friends to add to your active circle. They'll get follow-up reminders based on your tier settings.
        </Text>
      </View>

      {/* Select all */}
      <TouchableOpacity style={styles.selectAllRow} onPress={selectAll}>
        <Text style={styles.selectAllText}>
          {selectedIds.size === filteredFriends.length
            ? 'Deselect All'
            : 'Select All'}
        </Text>
        <Text style={styles.selectedCount}>
          {selectedIds.size} selected
        </Text>
      </TouchableOpacity>

      {/* Friends list */}
      <FlatList
        data={filteredFriends}
        renderItem={renderFriend}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.importButton, isSaving && styles.importButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.importButtonText}>
            {isSaving
              ? 'Saving...'
              : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  permissionIconText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  permissionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIconText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.accentDark,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    ...shadows.sm,
  },
  headerContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectAllText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  selectedCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactRowSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.card,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  contactDetail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  importButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
});
