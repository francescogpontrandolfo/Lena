// SQLite Database Service for Lena

import * as SQLite from 'expo-sqlite';
import { Friend, Interaction, Reminder, Settings, DEFAULT_SETTINGS, FriendTier, RelationshipType } from '../types';

// Database row type (SQLite stores booleans as integers)
interface FriendRow {
  id: string;
  name: string;
  photo: string | null;
  birthday: string | null;
  phone: string | null;
  city: string | null;
  relationshipType: RelationshipType;
  tier: FriendTier;
  isStarred: number;
  contactFrequencyDays: number;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contactId: string | null;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('lena.db');

  // Create tables
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo TEXT,
      birthday TEXT,
      phone TEXT,
      city TEXT,
      relationshipType TEXT NOT NULL DEFAULT 'friend',
      tier TEXT NOT NULL DEFAULT 'other',
      isStarred INTEGER NOT NULL DEFAULT 0,
      contactFrequencyDays INTEGER NOT NULL DEFAULT 14,
      lastContactedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      contactId TEXT
    );`);

  // Migration: Add tier and isStarred columns if they don't exist (for existing databases)
  try {
    await db.execAsync(`ALTER TABLE friends ADD COLUMN tier TEXT NOT NULL DEFAULT 'other'`);
  } catch {
    // Column already exists, ignore error
  }
  try {
    await db.execAsync(`ALTER TABLE friends ADD COLUMN isStarred INTEGER NOT NULL DEFAULT 0`);
  } catch {
    // Column already exists, ignore error
  }

  // Continue creating other tables
  await db.execAsync(`

    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      friendId TEXT NOT NULL,
      note TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      friendId TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      message TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_friendId ON interactions(friendId);
    CREATE INDEX IF NOT EXISTS idx_reminders_friendId ON reminders(friendId);
    CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
  `);

  // Initialize default settings if not exist
  const settingsCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM settings');
  if (settingsCount?.count === 0) {
    await saveSettings(DEFAULT_SETTINGS);
  }
}

function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// ============ FRIENDS ============

export async function getAllFriends(): Promise<Friend[]> {
  const result = await getDb().getAllAsync<FriendRow>('SELECT * FROM friends ORDER BY name ASC');
  return result.map(row => ({
    id: row.id,
    name: row.name,
    photo: row.photo ?? undefined,
    birthday: row.birthday ?? undefined,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    relationshipType: row.relationshipType,
    tier: row.tier,
    isStarred: Boolean(row.isStarred),
    contactFrequencyDays: row.contactFrequencyDays,
    lastContactedAt: row.lastContactedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    contactId: row.contactId ?? undefined,
  }));
}

export async function getFriendById(id: string): Promise<Friend | null> {
  const row = await getDb().getFirstAsync<FriendRow>('SELECT * FROM friends WHERE id = ?', [id]);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    photo: row.photo ?? undefined,
    birthday: row.birthday ?? undefined,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    relationshipType: row.relationshipType,
    tier: row.tier,
    isStarred: Boolean(row.isStarred),
    contactFrequencyDays: row.contactFrequencyDays,
    lastContactedAt: row.lastContactedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    contactId: row.contactId ?? undefined,
  };
}

export async function createFriend(friend: Omit<Friend, 'createdAt' | 'updatedAt'>): Promise<Friend> {
  const now = new Date().toISOString();
  const newFriend: Friend = {
    ...friend,
    createdAt: now,
    updatedAt: now,
  };

  await getDb().runAsync(
    `INSERT INTO friends (id, name, photo, birthday, phone, city, relationshipType, tier, isStarred, contactFrequencyDays, lastContactedAt, createdAt, updatedAt, contactId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newFriend.id,
      newFriend.name,
      newFriend.photo || null,
      newFriend.birthday || null,
      newFriend.phone || null,
      newFriend.city || null,
      newFriend.relationshipType,
      newFriend.tier,
      newFriend.isStarred ? 1 : 0,
      newFriend.contactFrequencyDays,
      newFriend.lastContactedAt || null,
      newFriend.createdAt,
      newFriend.updatedAt,
      newFriend.contactId || null,
    ]
  );

  return newFriend;
}

export async function updateFriend(id: string, updates: Partial<Friend>): Promise<void> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      // Convert isStarred boolean to integer for SQLite
      if (key === 'isStarred') {
        values.push(value ? 1 : 0);
      } else if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push((value as string | number | undefined) ?? null);
      }
    }
  });

  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  await getDb().runAsync(
    `UPDATE friends SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function updateFriendFromContact(
  friendId: string,
  contact: { name: string; phone?: string; birthday?: string; photo?: string }
): Promise<void> {
  await updateFriend(friendId, {
    name: contact.name,
    phone: contact.phone,
    birthday: contact.birthday,
    photo: contact.photo,
  });
}

export async function deleteFriend(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM friends WHERE id = ?', [id]);
}

export async function markFriendContacted(id: string): Promise<void> {
  const now = new Date().toISOString();
  await getDb().runAsync(
    'UPDATE friends SET lastContactedAt = ?, updatedAt = ? WHERE id = ?',
    [now, now, id]
  );
}

// ============ INTERACTIONS ============

export async function getInteractionsForFriend(friendId: string): Promise<Interaction[]> {
  const result = await getDb().getAllAsync<Interaction>(
    'SELECT * FROM interactions WHERE friendId = ? ORDER BY timestamp DESC',
    [friendId]
  );
  return result;
}

export async function createInteraction(interaction: Interaction): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO interactions (id, friendId, note, timestamp) VALUES (?, ?, ?, ?)',
    [interaction.id, interaction.friendId, interaction.note, interaction.timestamp]
  );

  // Also update the friend's lastContactedAt
  await markFriendContacted(interaction.friendId);
}

export async function deleteInteraction(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM interactions WHERE id = ?', [id]);
}

// ============ REMINDERS ============

export async function getRemindersForDate(date: string): Promise<Reminder[]> {
  const result = await getDb().getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE date = ? AND isCompleted = 0',
    [date]
  );
  return result.map(r => ({ ...r, isCompleted: Boolean(r.isCompleted) }));
}

export async function getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  const result = await getDb().getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE date >= ? AND date <= ? AND isCompleted = 0 ORDER BY date ASC',
    [today.toISOString().split('T')[0], futureDate.toISOString().split('T')[0]]
  );
  return result.map(r => ({ ...r, isCompleted: Boolean(r.isCompleted) }));
}

export async function createReminder(reminder: Reminder): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO reminders (id, friendId, type, date, message, isCompleted, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [reminder.id, reminder.friendId, reminder.type, reminder.date, reminder.message, reminder.isCompleted ? 1 : 0, reminder.createdAt]
  );
}

export async function completeReminder(id: string): Promise<void> {
  await getDb().runAsync('UPDATE reminders SET isCompleted = 1 WHERE id = ?', [id]);
}

export async function deleteReminder(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM reminders WHERE id = ?', [id]);
}

// ============ SETTINGS ============

export async function getSettings(): Promise<Settings> {
  const rows = await getDb().getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');

  const settings: Record<string, string | number | boolean> = {};
  rows.forEach(row => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });

  return { ...DEFAULT_SETTINGS, ...settings } as Settings;
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await getDb().runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, JSON.stringify(value)]
    );
  }
}

// ============ UTILITIES ============

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Reset lastContactedAt for all friends (for demo purposes)
export async function resetAllLastContacted(): Promise<void> {
  const now = new Date().toISOString();
  await getDb().runAsync(
    'UPDATE friends SET lastContactedAt = NULL, updatedAt = ?',
    [now]
  );
}

// Get friends who haven't been contacted within their frequency
export async function getFriendsNeedingContact(): Promise<Friend[]> {
  const friends = await getAllFriends();
  const now = new Date();

  return friends.filter(friend => {
    if (!friend.lastContactedAt) return true;

    const lastContact = new Date(friend.lastContactedAt);
    const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceContact >= friend.contactFrequencyDays;
  });
}

// Get friends with upcoming birthdays
export async function getFriendsWithUpcomingBirthdays(days: number = 7): Promise<Friend[]> {
  const friends = await getAllFriends();
  const today = new Date();

  return friends.filter(friend => {
    if (!friend.birthday) return false;

    // Parse birthday as local date components to avoid UTC midnight timezone offset issues
    const [, monthStr, dayStr] = friend.birthday.split('-');
    const thisYearBirthday = new Date(today.getFullYear(), parseInt(monthStr) - 1, parseInt(dayStr));

    // If birthday already passed this year, check next year
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.floor((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= days;
  }).sort((a, b) => {
    const [, aMonth, aDay] = a.birthday!.split('-').map(Number);
    const [, bMonth, bDay] = b.birthday!.split('-').map(Number);
    return aMonth - bMonth || aDay - bDay;
  });
}
