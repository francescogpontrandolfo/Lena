// Push Notifications Service

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Friend } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Schedule a birthday notification
export async function scheduleBirthdayNotification(
  friend: Friend,
  reminderTime: string = '09:00' // HH:mm format
): Promise<string | null> {
  if (!friend.birthday) return null;

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) return null;

  const [hours, minutes] = reminderTime.split(':').map(Number);

  // Parse birthday as local date components to avoid UTC midnight timezone offset issues
  const [, monthStr, dayStr] = friend.birthday.split('-');
  const birthdayMonth = parseInt(monthStr); // 1-indexed (required by CALENDAR trigger)
  const birthdayDay = parseInt(dayStr);

  // Use a repeating CALENDAR trigger so the notification fires every year automatically.
  // This avoids the one-time DATE trigger that would need manual rescheduling each year.
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${friend.name}'s Birthday!`,
      body: `Don't forget to wish ${friend.name} a happy birthday today!`,
      data: { friendId: friend.id, type: 'birthday' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      repeats: true,
      month: birthdayMonth,
      day: birthdayDay,
      hour: hours,
      minute: minutes,
    },
  });

  return identifier;
}

// Schedule a check-in reminder
export async function scheduleCheckInReminder(
  friend: Friend,
  daysFromNow: number = 1
): Promise<string | null> {
  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) return null;

  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + daysFromNow);
  scheduledDate.setHours(10, 0, 0, 0); // 10 AM

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to reach out!`,
      body: `You haven't talked to ${friend.name} in a while. Send them a message?`,
      data: { friendId: friend.id, type: 'check_in' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledDate,
    },
  });

  return identifier;
}

// Schedule a custom reminder
export async function scheduleCustomReminder(
  friend: Friend,
  message: string,
  date: Date
): Promise<string | null> {
  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) return null;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Reminder: ${friend.name}`,
      body: message,
      data: { friendId: friend.id, type: 'custom' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  return identifier;
}

// Cancel a specific notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all notifications for a friend
export async function cancelAllNotificationsForFriend(friendId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.friendId === friendId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Listen for notification responses (when user taps notification)
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Listen for notifications received while app is open
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Schedule birthday notifications for all friends with birthdays
export async function scheduleBirthdayNotificationsForAll(
  friends: Friend[],
  reminderTime: string = '09:00'
): Promise<{ scheduled: number; skipped: number }> {
  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    return { scheduled: 0, skipped: friends.filter(f => f.birthday).length };
  }

  // Cancel all existing birthday notifications first
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === 'birthday') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  let scheduledCount = 0;
  let skippedCount = 0;

  for (const friend of friends) {
    if (friend.birthday) {
      const identifier = await scheduleBirthdayNotification(friend, reminderTime);
      if (identifier) {
        scheduledCount++;
      } else {
        skippedCount++;
      }
    }
  }

  return { scheduled: scheduledCount, skipped: skippedCount };
}
