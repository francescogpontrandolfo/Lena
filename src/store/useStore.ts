// Zustand Store for Lena

import { create } from 'zustand';
import {
  Friend,
  Interaction,
  Settings,
  TimelineItem,
  DEFAULT_SETTINGS,
} from '../types';
import * as db from '../services/database';
import { format, differenceInDays, isSameDay, addDays } from 'date-fns';

interface LenaStore {
  // State
  friends: Friend[];
  interactions: Record<string, Interaction[]>; // keyed by friendId
  settings: Settings;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  loadFriends: () => Promise<void>;
  addFriend: (friend: Omit<Friend, 'createdAt' | 'updatedAt'>) => Promise<Friend>;
  updateFriend: (id: string, updates: Partial<Friend>) => Promise<void>;
  deleteFriend: (id: string) => Promise<void>;
  loadInteractions: (friendId: string) => Promise<void>;
  addInteraction: (friendId: string, note: string, date?: Date) => Promise<void>;
  snoozeFriend: (friendId: string) => Promise<void>;
  resetAllLastContacted: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  getTimelineItems: () => TimelineItem[];
  getBacklogItems: () => TimelineItem[];
  getFriendById: (id: string) => Friend | undefined;
}

export const useStore = create<LenaStore>((set, get) => ({
  // Initial state
  friends: [],
  interactions: {},
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  isInitialized: false,

  // Initialize app - call this on startup
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Initialize database
      await db.initDatabase();

      // Load initial data
      const [friends, settings] = await Promise.all([
        db.getAllFriends(),
        db.getSettings(),
      ]);

      set({
        friends,
        settings,
        isLoading: false,
        isInitialized: true,
      });

      // Auto-sync contacts in background (don't block app initialization)
      setTimeout(async () => {
        try {
          const { syncAllContacts, hasContactsPermission } = await import('../services/contacts');
          const { scheduleBirthdayNotificationsForAll } = await import('../services/notifications');
          const hasPermission = await hasContactsPermission();

          if (hasPermission) {
            const currentFriends = get().friends;
            const { imported, updated } = await syncAllContacts(currentFriends, get().settings.defaultContactFrequency);

            if (imported > 0 || updated > 0) {
              console.log(`Synced contacts: ${imported} imported, ${updated} updated`);
              await get().loadFriends();
            }
          }

          // Schedule birthday notifications for all friends with birthdays
          const allFriends = get().friends;
          const { scheduled, skipped } = await scheduleBirthdayNotificationsForAll(
            allFriends,
            get().settings.birthdayReminderTime
          );
          console.log(`Birthday notifications: ${scheduled} scheduled, ${skipped} skipped`);
        } catch (error) {
          console.error('Background contact sync failed:', error);
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ isLoading: false });
    }
  },

  // Load/reload friends
  loadFriends: async () => {
    try {
      const friends = await db.getAllFriends();
      set({ friends });
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  },

  // Add a new friend
  addFriend: async (friendData) => {
    const friend = await db.createFriend({
      ...friendData,
      id: db.generateId(),
    });

    set(state => ({
      friends: [...state.friends, friend].sort((a, b) => a.name.localeCompare(b.name)),
    }));

    return friend;
  },

  // Update a friend
  updateFriend: async (id, updates) => {
    await db.updateFriend(id, updates);

    set(state => ({
      friends: state.friends
        .map(f => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  // Delete a friend
  deleteFriend: async (id) => {
    await db.deleteFriend(id);

    set(state => ({
      friends: state.friends.filter(f => f.id !== id),
      interactions: Object.fromEntries(
        Object.entries(state.interactions).filter(([key]) => key !== id)
      ),
    }));
  },

  // Load interactions for a friend
  loadInteractions: async (friendId) => {
    try {
      const interactions = await db.getInteractionsForFriend(friendId);

      set(state => ({
        interactions: {
          ...state.interactions,
          [friendId]: interactions,
        },
      }));
    } catch (error) {
      console.error('Failed to load interactions:', error);
    }
  },

  // Add an interaction (quick log)
  addInteraction: async (friendId, note, date) => {
    const timestamp = date ? date.toISOString() : new Date().toISOString();
    const interaction: Interaction = {
      id: db.generateId(),
      friendId,
      note,
      timestamp,
    };

    await db.createInteraction(interaction);

    // Update local state
    set(state => ({
      interactions: {
        ...state.interactions,
        [friendId]: [interaction, ...(state.interactions[friendId] || [])],
      },
      friends: state.friends.map(f =>
        f.id === friendId
          ? { ...f, lastContactedAt: interaction.timestamp, updatedAt: interaction.timestamp }
          : f
      ),
    }));
  },

  // Snooze a friend - reset lastContactedAt without logging an interaction
  snoozeFriend: async (friendId) => {
    const now = new Date().toISOString();
    await db.updateFriend(friendId, { lastContactedAt: now });

    set(state => ({
      friends: state.friends.map(f =>
        f.id === friendId
          ? { ...f, lastContactedAt: now, updatedAt: now }
          : f
      ),
    }));
  },

  // Reset all lastContactedAt to null (for demo purposes)
  resetAllLastContacted: async () => {
    await db.resetAllLastContacted();
    set(state => ({
      friends: state.friends.map(f => ({ ...f, lastContactedAt: undefined })),
    }));
  },

  // Update settings
  updateSettings: async (newSettings) => {
    try {
      await db.saveSettings(newSettings);

      set(state => ({
        settings: { ...state.settings, ...newSettings },
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Get friend by ID
  getFriendById: (id) => {
    return get().friends.find(f => f.id === id);
  },

  // Generate timeline items for home screen
  getTimelineItems: () => {
    const { friends, settings } = get();
    const items: TimelineItem[] = [];
    const today = new Date();

    friends.forEach(friend => {
      // Check for birthdays
      if (friend.birthday) {
        const birthday = new Date(friend.birthday);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthday.getMonth(),
          birthday.getDate()
        );

        // If birthday passed, check next year
        if (thisYearBirthday < today && !isSameDay(thisYearBirthday, today)) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysUntil = differenceInDays(thisYearBirthday, today);

        if (daysUntil === 0) {
          // Birthday today!
          items.push({
            id: `birthday-${friend.id}`,
            type: 'birthday_today',
            friend,
            title: `${friend.name}'s Birthday!`,
            subtitle: 'Send them your wishes',
            date: thisYearBirthday.toISOString(),
            priority: 100,
          });
        } else if (daysUntil > 0 && daysUntil <= 7) {
          // Upcoming birthday
          items.push({
            id: `birthday-upcoming-${friend.id}`,
            type: 'birthday_upcoming',
            friend,
            title: `${friend.name}'s Birthday`,
            subtitle: daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days`,
            date: thisYearBirthday.toISOString(),
            priority: 50 - daysUntil,
          });
        }
      }

      // Check for check-in suggestions - ONLY for friends in active tiers (not 'other')
      if (settings.checkInReminderEnabled && friend.tier !== 'other') {
        const daysSinceContact = friend.lastContactedAt
          ? differenceInDays(today, new Date(friend.lastContactedAt))
          : Infinity;

        if (daysSinceContact >= friend.contactFrequencyDays) {
          items.push({
            id: `checkin-${friend.id}`,
            type: 'check_in_suggestion',
            friend,
            title: `Reach out to ${friend.name}`,
            subtitle: friend.lastContactedAt
              ? `Last catch-up ${daysSinceContact} days ago`
              : '',
            date: today.toISOString(),
            priority: Math.min(30, daysSinceContact / friend.contactFrequencyDays * 10),
          });
        }
      }
    });

    // Sort by priority (highest first)
    return items.sort((a, b) => b.priority - a.priority);
  },

  // Get backlog items - friends not in urgent timeline, sorted by priority
  getBacklogItems: () => {
    const { friends, settings } = get();
    const items: TimelineItem[] = [];
    const today = new Date();

    // Tier weights for sorting (higher = more important)
    const tierWeights: Record<string, number> = {
      top: 4,
      close: 3,
      cordialities: 2,
      other: 1,
    };

    // Get IDs of friends already in urgent timeline (check-in suggestions)
    const urgentFriendIds = new Set<string>();
    friends.forEach(friend => {
      if (settings.checkInReminderEnabled && friend.tier !== 'other') {
        const daysSinceContact = friend.lastContactedAt
          ? differenceInDays(today, new Date(friend.lastContactedAt))
          : Infinity;
        if (daysSinceContact >= friend.contactFrequencyDays) {
          urgentFriendIds.add(friend.id);
        }
      }
    });

    // Build backlog from friends NOT in urgent timeline - ONLY active tiers
    friends.forEach(friend => {
      if (urgentFriendIds.has(friend.id) || friend.tier === 'other') return; // Skip urgent ones and 'other' tier

      const daysSinceContact = friend.lastContactedAt
        ? differenceInDays(today, new Date(friend.lastContactedAt))
        : Infinity;

      // Calculate priority score based on:
      // - Days since contact relative to frequency
      // - Tier importance
      // - Starred boost
      const overdueRatio = daysSinceContact / friend.contactFrequencyDays;
      const tierWeight = tierWeights[friend.tier] || 1;
      const starredBoost = friend.isStarred ? 1.5 : 1;
      const priority = overdueRatio * tierWeight * starredBoost;

      items.push({
        id: `backlog-${friend.id}`,
        type: 'check_in_suggestion',
        friend,
        title: friend.name,
        subtitle: friend.lastContactedAt
          ? `${daysSinceContact} days ago`
          : 'Not yet contacted',
        date: today.toISOString(),
        priority,
      });
    });

    // Sort by priority (highest first) and limit to 10 items
    return items.sort((a, b) => b.priority - a.priority).slice(0, 10);
  },
}));
