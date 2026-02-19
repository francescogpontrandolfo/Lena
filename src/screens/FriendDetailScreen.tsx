// Friend Detail Screen - Modern Card-Based Design

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, differenceInDays } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS, TIER_LABELS, FriendTier, FREQUENCY_OPTIONS } from '../types';
import { RootStackParamList } from '../navigation';
import QuickLogModal from '../components/QuickLogModal';
import StatusBadge, { getContactStatus } from '../components/StatusBadge';
import InteractionTimeline from '../components/InteractionTimeline';
import EditChipModal from '../components/EditChipModal';
import DatePickerModal from '../components/DatePickerModal';
import Avatar from '../components/Avatar';

type EditModalType = 'birthday' | 'tier' | 'frequency' | null;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'FriendDetail'>;

export default function FriendDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { friendId, isBirthday } = route.params;

  const {
    getFriendById,
    interactions,
    loadInteractions,
    addInteraction,
    deleteFriend,
    updateFriend,
  } = useStore();

  const friend = getFriendById(friendId);
  const friendInteractions = interactions[friendId] || [];
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeEditModal, setActiveEditModal] = useState<EditModalType>(null);

  // Fade-in animation on mount
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation for button presses
  const whatsappScale = React.useRef(new Animated.Value(1)).current;
  const logScale = React.useRef(new Animated.Value(1)).current;

  const animatePress = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(callback);
  };

  useEffect(() => {
    loadInteractions(friendId);
  }, [friendId]);

  useEffect(() => {
    if (friend) {
      navigation.setOptions({ title: '' }); // Clean header
    }
  }, [friend, navigation]);

  if (!friend) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Friend not found</Text>
      </View>
    );
  }

  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  };

  const handleWhatsApp = () => {
    if (friend.phone) {
      animatePress(whatsappScale, () => {
        const cleanPhone = cleanPhoneNumber(friend.phone!);
        const messageText = isBirthday ? 'Buon compleanno ❤️' : 'Come va??';
        const message = encodeURIComponent(messageText);
        Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
      });
    }
  };

  const handleLogPress = () => {
    animatePress(logScale, () => setShowLogModal(true));
  };

  const handleEdit = () => {
    navigation.navigate('AddFriend', { friendId: friend.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Friend',
      `Are you sure you want to remove ${friend.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteFriend(friend.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleLogInteraction = async (note: string, date: Date) => {
    await addInteraction(friend.id, note, date);
    setShowLogModal(false);
  };

  // Chip edit handlers
  const handleBirthdayChange = async (date: string) => {
    await updateFriend(friend.id, { birthday: date });
  };

  const handleBirthdayClear = async () => {
    await updateFriend(friend.id, { birthday: undefined });
  };

  const handleTierChange = async (tier: string | number) => {
    await updateFriend(friend.id, { tier: tier as FriendTier });
  };

  const handleFrequencyChange = async (frequency: string | number) => {
    await updateFriend(friend.id, { contactFrequencyDays: frequency as number });
  };

  const getFrequencyLabel = (days: number): string => {
    const option = FREQUENCY_OPTIONS.find(o => o.value === days);
    return option?.label || `${days} days`;
  };

  const getDaysSinceContact = () => {
    if (!friend.lastContactedAt) return null;
    return differenceInDays(new Date(), new Date(friend.lastContactedAt));
  };

  const daysSince = getDaysSinceContact();
  const status = getContactStatus(friend.lastContactedAt, friend.contactFrequencyDays, isBirthday);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Hero Profile Card */}
        <Animated.View style={[styles.heroCard, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <View style={styles.heroTop}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <Avatar
                name={friend.name}
                photo={friend.photo}
                size={80}
                color={RELATIONSHIP_COLORS[friend.relationshipType]}
              />
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <Text style={styles.name}>{friend.name}</Text>
              <View style={styles.subtitleRow}>
                {friend.city && (
                  <Text style={styles.city}>{friend.city}</Text>
                )}
                {friend.city && <Text style={styles.dot}>•</Text>}
                <Text style={styles.relationship}>
                  {RELATIONSHIP_LABELS[friend.relationshipType]}
                </Text>
              </View>
              <StatusBadge status={status} />
            </View>
          </View>

          {/* Info Chips - All tappable/editable */}
          <View style={styles.chipsContainer}>
            {/* Row 1: Birthday + Frequency */}
            <View style={styles.chipsRow}>
              {/* Birthday Chip */}
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setActiveEditModal('birthday')}
                activeOpacity={0.7}
              >
                <Feather name="gift" size={16} color={colors.textSecondary} />
                <View style={styles.chipTextContainer}>
                  <Text style={styles.chipValue} numberOfLines={1}>
                    {friend.birthday ? format(new Date(friend.birthday), 'MMM d') : 'Add'}
                  </Text>
                  <Text style={styles.chipLabel}>Birthday</Text>
                </View>
                <Feather name="chevron-right" size={14} color={colors.textLight} />
              </TouchableOpacity>

              {/* Frequency Chip */}
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setActiveEditModal('frequency')}
                activeOpacity={0.7}
              >
                <Feather name="calendar" size={16} color={colors.textSecondary} />
                <View style={styles.chipTextContainer}>
                  <Text style={styles.chipValue} numberOfLines={1}>{getFrequencyLabel(friend.contactFrequencyDays)}</Text>
                  <Text style={styles.chipLabel}>Frequency</Text>
                </View>
                <Feather name="chevron-right" size={14} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Row 2: Tier (full width) */}
            <View style={styles.chipsRow}>
              {/* Tier Chip */}
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setActiveEditModal('tier')}
                activeOpacity={0.7}
              >
                <Feather name="star" size={16} color={colors.textSecondary} />
                <View style={styles.chipTextContainer}>
                  <Text style={styles.chipValue} numberOfLines={1}>{TIER_LABELS[friend.tier]}</Text>
                  <Text style={styles.chipLabel}>Tier</Text>
                </View>
                <Feather name="chevron-right" size={14} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {friend.phone && (
            <Animated.View style={[styles.actionButtonWrapper, { transform: [{ scale: whatsappScale }] }]}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleWhatsApp}
                activeOpacity={0.8}
              >
                <Feather name="message-circle" size={20} color={colors.primary} />
                <Text style={styles.actionLabel}>WhatsApp</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          <Animated.View style={[styles.actionButtonWrapper, styles.primaryAction, { transform: [{ scale: logScale }] }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleLogPress}
              activeOpacity={0.8}
            >
              <Feather name="edit" size={20} color={colors.card} />
              <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>Log Contact</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Interaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interaction History</Text>
            {friendInteractions.length > 0 && (
              <TouchableOpacity onPress={() => setShowLogModal(true)}>
                <Text style={styles.addLink}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <InteractionTimeline
            interactions={friendInteractions}
            onAddPress={() => setShowLogModal(true)}
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Remove Friend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QuickLogModal
        visible={showLogModal}
        friendName={friend.name}
        friendId={friend.id}
        onClose={() => setShowLogModal(false)}
        onSave={handleLogInteraction}
      />

      {/* Edit Modals */}
      <DatePickerModal
        visible={activeEditModal === 'birthday'}
        currentDate={friend.birthday}
        onSelect={handleBirthdayChange}
        onClear={handleBirthdayClear}
        onClose={() => setActiveEditModal(null)}
      />

      <EditChipModal
        visible={activeEditModal === 'tier'}
        title="Set Priority Tier"
        options={[
          { value: 'top', label: 'Clique - Your closest friends' },
          { value: 'close', label: 'Good friends' },
          { value: 'cordialities', label: 'Catch-up - Casual friends' },
          { value: 'other', label: 'Other - Everyone else' },
        ]}
        selectedValue={friend.tier}
        onSelect={handleTierChange}
        onClose={() => setActiveEditModal(null)}
      />

      <EditChipModal
        visible={activeEditModal === 'frequency'}
        title="Contact Frequency"
        options={FREQUENCY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
        selectedValue={friend.contactFrequencyDays}
        onSelect={handleFrequencyChange}
        onClose={() => setActiveEditModal(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  heroTop: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatarSection: {
    marginRight: spacing.lg,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  city: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  dot: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  relationship: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Info Chips (tappable)
  chipsContainer: {
    gap: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: 8,
    minHeight: 80,
  },
  chipTextContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  chipValue: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    numberOfLines: 1,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  primaryAction: {
    flex: 1.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  actionLabelPrimary: {
    color: colors.card,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  addLink: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },

  // Footer
  footerActions: {
    gap: spacing.md,
  },
  editButton: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  deleteButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: typography.sizes.md,
    color: colors.error,
  },
});
