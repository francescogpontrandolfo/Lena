// Lena Type Definitions

export type RelationshipType =
  | 'close_friend'
  | 'friend'
  | 'family'
  | 'colleague'
  | 'acquaintance';

export type FriendTier = 'top' | 'close' | 'cordialities' | 'other';

export interface Friend {
  id: string;
  name: string;
  photo?: string;           // URI to local image
  birthday?: string;        // ISO date string (YYYY-MM-DD)
  phone?: string;
  city?: string;
  relationshipType: RelationshipType;
  tier: FriendTier;              // Priority tier for contact suggestions
  isStarred: boolean;            // Starred/favorite friends
  contactFrequencyDays: number;  // How often to remind (e.g., 14 = every 2 weeks)
  lastContactedAt?: string;      // ISO datetime
  createdAt: string;             // ISO datetime
  updatedAt: string;             // ISO datetime
  contactId?: string;            // Link to iPhone Contacts
}

export interface Interaction {
  id: string;
  friendId: string;
  note: string;
  timestamp: string;        // ISO datetime
}

export type ReminderType =
  | 'birthday'
  | 'check_in'
  | 'custom';

export interface Reminder {
  id: string;
  friendId: string;
  type: ReminderType;
  date: string;             // ISO date string
  message: string;
  isCompleted: boolean;
  createdAt: string;
}

// Timeline item for home screen
export type TimelineItemType =
  | 'birthday_today'
  | 'birthday_upcoming'
  | 'check_in_suggestion'
  | 'custom_reminder';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  friend: Friend;
  title: string;
  subtitle: string;
  date: string;
  priority: number;         // Higher = more important
}

// For Contacts import
export interface ImportedContact {
  id: string;
  name: string;
  phone?: string;
  birthday?: string;
  photo?: string;
}

// App settings
export interface Settings {
  notificationsEnabled: boolean;
  birthdayReminderTime: string;   // HH:mm format
  defaultContactFrequency: number; // days
  checkInReminderEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: true,
  birthdayReminderTime: '09:00',
  defaultContactFrequency: 14,
  checkInReminderEnabled: true,
  hasCompletedOnboarding: false,
};

// Relationship type display labels
export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  close_friend: 'Close Friend',
  friend: 'Friend',
  family: 'Family',
  colleague: 'Colleague',
  acquaintance: 'Acquaintance',
};

// Relationship type colors (for badges) - Elegant Sunset palette
export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  close_friend: '#D9853B',  // golden orange - warm, close
  friend: '#C4956C',        // dusty amber - friendly warmth
  family: '#9B8FAA',        // muted lavender - family connection
  colleague: '#A67A52',     // deep amber - professional
  acquaintance: '#8E7F76',  // warm brown - casual
};

// Friend tier labels
export const TIER_LABELS: Record<FriendTier, string> = {
  top: 'Clique',
  close: 'Good friends',
  cordialities: 'Catch-up',
  other: 'Other',
};

// Friend tier colors - Elegant Sunset palette
export const TIER_COLORS: Record<FriendTier, string> = {
  top: '#D9853B',           // golden orange - most important
  close: '#C4956C',         // dusty amber - close connections
  cordialities: '#9B8FAA',  // muted lavender - casual friendships
  other: '#8E7F76',         // warm brown - other contacts
};

// Contact frequency options
export const FREQUENCY_OPTIONS = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 30, label: '1 month' },
  { value: 90, label: '3 months' },
];
