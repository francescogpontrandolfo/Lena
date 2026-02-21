// Onboarding Screen — 4-step interactive first-launch flow

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import Avatar from '../components/Avatar';
import QuickLogModal from '../components/QuickLogModal';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_STEPS = 4;

export default function OnboardingScreen({ navigation }: Props) {
  const { friends, updateFriend, addFriend, addInteraction, updateSettings, settings } = useStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  // Step 1 — import contacts
  const [importNavigated, setImportNavigated] = useState(false);
  const [hasOpenedImport, setHasOpenedImport] = useState(false);
  // Step 2 — top-tier friend
  const [selectedTopFriendId, setSelectedTopFriendId] = useState<string | null>(null);
  const [newFriendName, setNewFriendName] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  // Step 3 — log interaction
  const [hasLoggedInteraction, setHasLoggedInteraction] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Detect return from ImportContacts screen
  useFocusEffect(
    useCallback(() => {
      if (importNavigated) {
        setHasOpenedImport(true);
      }
    }, [importNavigated])
  );

  // Derived: any friend is in top tier (either via this session or pre-existing)
  const hasTopTierFriend = friends.some(f => f.tier === 'top') || selectedTopFriendId !== null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleImportFromiPhone = () => {
    setImportNavigated(true);
    navigation.navigate('ImportContacts');
  };

  const handleSelectTopFriend = async (friendId: string) => {
    setSelectedTopFriendId(friendId);
    await updateFriend(friendId, { tier: 'top' });
  };

  const handleAddNewFriend = async () => {
    const name = newFriendName.trim();
    if (!name) return;
    setIsAddingFriend(true);
    try {
      const created = await addFriend({
        id: 'temp',
        name,
        tier: 'top',
        relationshipType: 'close_friend',
        isStarred: false,
        contactFrequencyDays: settings.defaultContactFrequency,
      });
      setSelectedTopFriendId(created.id);
      setNewFriendName('');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleQuickLogSave = async (note: string, date: Date, friendId?: string) => {
    if (friendId) {
      await addInteraction(friendId, note, date);
    }
    setShowQuickLog(false);
    setHasLoggedInteraction(true);
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleComplete = async () => {
    await updateSettings({ hasCompletedOnboarding: true });
    navigation.replace('MainTabs');
  };

  const handleSkip = async () => {
    await updateSettings({ hasCompletedOnboarding: true });
    navigation.replace('MainTabs');
  };

  // ── Step dots ─────────────────────────────────────────────────────────────

  const renderDots = () => (
    <View style={styles.dotsRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i <= step ? styles.dotFilled : styles.dotOutline]}
        />
      ))}
    </View>
  );

  // ── Step 0 — Welcome ──────────────────────────────────────────────────────

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Lena</Text>
      </View>
      <Text style={styles.stepTitle}>Welcome to Lena</Text>
      <Text style={styles.stepBody}>
        Good relationships don't happen by accident. Lena helps you stay intentional. Let's set things up in 3 quick steps.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(1)} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Let's go →</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Step 1 — Import contacts ──────────────────────────────────────────────

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconCircle}>
        <Feather name="users" size={36} color={colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Add your friends</Text>
      <Text style={styles.stepBody}>
        Lena can pull names, birthdays, and photos directly from your iPhone contacts.
      </Text>

      {!hasOpenedImport ? (
        <TouchableOpacity style={styles.primaryButton} onPress={handleImportFromiPhone} activeOpacity={0.85}>
          <Feather name="smartphone" size={18} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Import from iPhone</Text>
        </TouchableOpacity>
      ) : (
        <>
          {friends.length > 0 && (
            <View style={styles.importSuccessBadge}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.importSuccessText}>
                {friends.length} friend{friends.length !== 1 ? 's' : ''} added
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Continue →</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.textLink} onPress={() => setStep(2)}>
        <Text style={styles.textLinkText}>Skip, I'll add friends manually</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Step 2 — Set top-tier friend ──────────────────────────────────────────

  const renderStep2 = () => {
    const hasFriends = friends.length > 0;

    return (
      <View style={[styles.stepContent, styles.stepContentStretch]}>
        <View style={styles.iconCircle}>
          <Feather name="star" size={36} color={colors.primary} />
        </View>
        <Text style={styles.stepTitle}>Who's in your Clique?</Text>
        <Text style={styles.stepBody}>
          Your Clique is your inner circle — people you want to stay closest to. Pick one friend to start.
        </Text>

        {hasFriends ? (
          <ScrollView
            style={styles.friendList}
            contentContainerStyle={styles.friendListContent}
            showsVerticalScrollIndicator={false}
          >
            {friends.map(friend => {
              const isSelected = friend.id === selectedTopFriendId || friend.tier === 'top';
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[styles.friendRow, isSelected && styles.friendRowSelected]}
                  onPress={() => handleSelectTopFriend(friend.id)}
                  activeOpacity={0.75}
                >
                  <Avatar name={friend.name} photo={friend.photo} size={44} />
                  <Text style={styles.friendRowName}>{friend.name}</Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Feather name="check" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.addFriendForm}>
            <Text style={styles.addFriendLabel}>Add a friend to your Clique</Text>
            <View style={styles.addFriendRow}>
              <TextInput
                style={styles.addFriendInput}
                placeholder="Friend's name"
                placeholderTextColor={colors.textLight}
                value={newFriendName}
                onChangeText={setNewFriendName}
                returnKeyType="done"
                onSubmitEditing={handleAddNewFriend}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.addFriendButton,
                  (!newFriendName.trim() || isAddingFriend) && styles.addFriendButtonDisabled,
                ]}
                onPress={handleAddNewFriend}
                disabled={!newFriendName.trim() || isAddingFriend}
                activeOpacity={0.85}
              >
                {isAddingFriend ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Feather name="plus" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, !hasTopTierFriend && styles.primaryButtonDisabled]}
          onPress={() => hasTopTierFriend && setStep(3)}
          disabled={!hasTopTierFriend}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Step 3 — Log interaction ──────────────────────────────────────────────

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconCircle}>
        <Feather name="edit-2" size={36} color={colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Log your first check-in</Text>
      <Text style={styles.stepBody}>
        After a call, text, or coffee — just log it. Lena remembers so you don't have to.
      </Text>

      {!hasLoggedInteraction ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowQuickLog(true)}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={18} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Log an interaction</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Animated.View
            style={[
              styles.successContainer,
              { opacity: successAnim, transform: [{ scale: successAnim }] },
            ]}
          >
            <Feather name="check-circle" size={52} color={colors.success} />
            <Text style={styles.successText}>Interaction logged!</Text>
          </Animated.View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleComplete} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Finish →</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // ── Root render ───────────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
    >
      {/* Skip button — visible on steps 1–3 */}
      {step > 0 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      {renderDots()}

      <View style={styles.body}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      {/* QuickLogModal for step 3 */}
      <QuickLogModal
        visible={showQuickLog}
        onClose={() => setShowQuickLog(false)}
        onSave={handleQuickLogSave}
      />
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Skip button ──────────────────────────────────────────────────────────
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },

  // ── Step dots ────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl + spacing.md,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  // ── Body (scrollable host) ────────────────────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // ── Step content wrappers ─────────────────────────────────────────────────
  stepContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  // Step 2 stretches the list area
  stepContentStretch: {
    alignItems: 'stretch',
  },

  // ── Welcome logo ──────────────────────────────────────────────────────────
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  logoText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#FFF',
  },

  // ── Step icon circle ──────────────────────────────────────────────────────
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },

  // ── Step text ─────────────────────────────────────────────────────────────
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepBody: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },

  // ── Primary button ────────────────────────────────────────────────────────
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },

  // ── Text link ─────────────────────────────────────────────────────────────
  textLink: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  textLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // ── Import success badge ──────────────────────────────────────────────────
  importSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success + '18',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  importSuccessText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.success,
  },

  // ── Friends list (step 2) ─────────────────────────────────────────────────
  friendList: {
    flex: 1,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  friendListContent: {
    paddingVertical: spacing.xs,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  friendRowSelected: {
    backgroundColor: colors.primaryLight + '60',
  },
  friendRowName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Add friend form (step 2, no friends) ─────────────────────────────────
  addFriendForm: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  addFriendLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  addFriendRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addFriendInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addFriendButton: {
    width: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addFriendButtonDisabled: {
    opacity: 0.45,
  },

  // ── Success animation (step 3) ────────────────────────────────────────────
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  successText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
});
