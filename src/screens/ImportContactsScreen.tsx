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
import { ImportedContact } from '../types';
import { getContactsFromPhone } from '../services/contacts';
import { generateId } from '../services/database';

export default function ImportContactsScreen() {
  const navigation = useNavigation();
  const { friends, addFriend, settings } = useStore();

  const [contacts, setContacts] = useState<ImportedContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Get IDs of contacts already imported
  const existingContactIds = new Set(
    friends.filter(f => f.contactId).map(f => f.contactId)
  );

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    setPermissionDenied(false);

    // Check current permission status
    const { status: currentStatus } = await Contacts.getPermissionsAsync();

    if (currentStatus === 'granted') {
      setHasPermission(true);
    } else if (currentStatus === 'denied') {
      // Permission was previously denied - need to go to Settings
      setHasPermission(false);
      setPermissionDenied(true);
      setIsLoading(false);
      return;
    } else {
      // Permission not determined yet - request it
      const { status: newStatus } = await Contacts.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        setHasPermission(false);
        setPermissionDenied(newStatus === 'denied');
        setIsLoading(false);
        return;
      }
      setHasPermission(true);
    }

    const phoneContacts = await getContactsFromPhone();
    // Filter out already imported contacts
    const newContacts = phoneContacts.filter(
      c => !existingContactIds.has(c.id)
    );
    setContacts(newContacts);
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
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;

    setIsImporting(true);

    try {
      const selectedContacts = contacts.filter(c => selectedIds.has(c.id));

      for (const contact of selectedContacts) {
        await addFriend({
          id: generateId(),
          name: contact.name,
          photo: contact.photo,
          birthday: contact.birthday,
          phone: contact.phone,
          relationshipType: 'friend',
          tier: 'other',
          isStarred: false,
          contactFrequencyDays: settings.defaultContactFrequency,
          contactId: contact.id,
        });
      }

      Alert.alert(
        'Success',
        `Imported ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to import contacts. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = ({ item }: { item: ImportedContact }) => {
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
            <Text style={styles.contactDetail}>Birthday saved</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadContacts}>
            <Text style={styles.retryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIconText}>Done</Text>
        </View>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>
          All your contacts have already been imported.
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

      {/* Select all */}
      <TouchableOpacity style={styles.selectAllRow} onPress={selectAll}>
        <Text style={styles.selectAllText}>
          {selectedIds.size === filteredContacts.length
            ? 'Deselect All'
            : 'Select All'}
        </Text>
        <Text style={styles.selectedCount}>
          {selectedIds.size} selected
        </Text>
      </TouchableOpacity>

      {/* Contacts list */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Import button */}
      {selectedIds.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.importButton, isImporting && styles.importButtonDisabled]}
            onPress={handleImport}
            disabled={isImporting}
          >
            <Text style={styles.importButtonText}>
              {isImporting
                ? 'Importing...'
                : `Import ${selectedIds.size} Contact${selectedIds.size > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    color: colors.textPrimary,
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
