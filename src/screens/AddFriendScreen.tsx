// Add/Edit Friend Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useStore } from '../store/useStore';
import {
  RelationshipType,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_COLORS,
  FriendTier,
  TIER_LABELS,
  TIER_COLORS,
} from '../types';
import { RootStackParamList } from '../navigation';
import { generateId } from '../services/database';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'AddFriend'>;

const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'close_friend',
  'friend',
  'family',
  'colleague',
  'acquaintance',
];

const FREQUENCY_OPTIONS = [
  { value: 7, label: 'Weekly' },
  { value: 14, label: 'Every 2 weeks' },
  { value: 30, label: 'Monthly' },
  { value: 60, label: 'Every 2 months' },
  { value: 90, label: 'Quarterly' },
];

const TIER_OPTIONS: FriendTier[] = ['top', 'close', 'cordialities', 'other'];

export default function AddFriendScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const friendId = route.params?.friendId;
  const defaultTier = (route.params?.defaultTier as FriendTier) || 'other';

  const { getFriendById, addFriend, updateFriend } = useStore();
  const existingFriend = friendId ? getFriendById(friendId) : null;

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('friend');
  const [tier, setTier] = useState<FriendTier>(defaultTier);
  const [isStarred, setIsStarred] = useState(false);
  const [contactFrequency, setContactFrequency] = useState(14);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const birthdayDate = birthday
    ? parse(birthday, 'yyyy-MM-dd', new Date())
    : new Date(2000, 0, 1);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthday(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  useEffect(() => {
    if (existingFriend) {
      setName(existingFriend.name);
      setPhoto(existingFriend.photo);
      setBirthday(existingFriend.birthday || '');
      setPhone(existingFriend.phone || '');
      setCity(existingFriend.city || '');
      setRelationshipType(existingFriend.relationshipType);
      setTier(existingFriend.tier || 'other');
      setIsStarred(existingFriend.isStarred || false);
      setContactFrequency(existingFriend.contactFrequencyDays);
    }
  }, [existingFriend]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to add a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setIsSaving(true);

    try {
      if (existingFriend) {
        await updateFriend(existingFriend.id, {
          name: name.trim(),
          photo,
          birthday: birthday || undefined,
          phone: phone || undefined,
          city: city || undefined,
          relationshipType,
          tier,
          isStarred,
          contactFrequencyDays: contactFrequency,
        });
      } else {
        await addFriend({
          id: generateId(),
          name: name.trim(),
          photo,
          birthday: birthday || undefined,
          phone: phone || undefined,
          city: city || undefined,
          relationshipType,
          tier,
          isStarred,
          contactFrequencyDays: contactFrequency,
        });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save friend. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo picker */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderLabel}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Relationship type */}
        <View style={styles.field}>
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.optionGroup}>
            {RELATIONSHIP_OPTIONS.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  relationshipType === type && {
                    backgroundColor: RELATIONSHIP_COLORS[type],
                    borderColor: RELATIONSHIP_COLORS[type],
                  },
                ]}
                onPress={() => setRelationshipType(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    relationshipType === type && styles.optionTextSelected,
                  ]}
                >
                  {RELATIONSHIP_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tier */}
        <View style={styles.field}>
          <Text style={styles.label}>Priority Tier</Text>
          <View style={styles.optionGroup}>
            {TIER_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.optionButton,
                  tier === t && {
                    backgroundColor: TIER_COLORS[t],
                    borderColor: TIER_COLORS[t],
                  },
                ]}
                onPress={() => setTier(t)}
              >
                <Text
                  style={[
                    styles.optionText,
                    tier === t && styles.optionTextSelected,
                  ]}
                >
                  {TIER_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Starred */}
        <View style={styles.field}>
          <TouchableOpacity
            style={styles.starredRow}
            onPress={() => setIsStarred(!isStarred)}
          >
            <View style={styles.starredInfo}>
              <Text style={styles.label}>Starred</Text>
              <Text style={styles.starredHint}>
                Starred friends appear at the top of your list
              </Text>
            </View>
            <View style={[styles.starButton, isStarred && styles.starButtonActive]}>
              <Text style={styles.starButtonText}>{isStarred ? 'Yes' : 'No'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Birthday */}
        <View style={styles.field}>
          <Text style={styles.label}>Birthday</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={birthday ? styles.dateText : styles.datePlaceholder}>
              {birthday ? format(birthdayDate, 'MMMM d, yyyy') : 'Select birthday'}
            </Text>
            {birthday ? (
              <TouchableOpacity
                onPress={() => { setBirthday(''); setShowDatePicker(false); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.dateClear}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdayDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
              style={styles.datePicker}
            />
          )}
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        {/* City */}
        <View style={styles.field}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Where do they live?"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Contact frequency */}
        <View style={styles.field}>
          <Text style={styles.label}>Reminder Frequency</Text>
          <View style={styles.frequencyGroup}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  contactFrequency === option.value && styles.frequencyButtonSelected,
                ]}
                onPress={() => setContactFrequency(option.value)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    contactFrequency === option.value && styles.frequencyTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : existingFriend ? 'Save Changes' : 'Add Friend'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: spacing.xxl,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholderLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    ...shadows.sm,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  frequencyGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  frequencyTextSelected: {
    color: colors.card,
    fontWeight: typography.weights.medium,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.card,
  },
  starredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  starredInfo: {
    flex: 1,
  },
  starredHint: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  starButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  starButtonActive: {
    backgroundColor: colors.secondary,
  },
  starButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  dateButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  dateText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
  },
  dateClear: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  datePicker: {
    marginTop: spacing.sm,
  },
});
