// Lena - Friend Relationship Manager
// Main App Entry Point

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { useStore } from './src/store/useStore';
import { colors, typography } from './src/theme';

function AppContent() {
  const { initialize, isLoading, isInitialized, loadFriends, friends, settings } = useStore();
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load. Please restart the app.');
      }
    };

    init();
  }, [initialize]);

  // Listen for app state changes to sync contacts when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      const wasBackground = appState.current.match(/inactive|background/);
      const isNowActive = nextAppState === 'active';

      if (wasBackground && !isNowActive) {
        // Just went to background - record timestamp
        backgroundedAt.current = Date.now();
      }

      if (wasBackground && isNowActive && isInitialized) {
        // Only sync if we were in background for more than 60 seconds
        const timeInBackground = backgroundedAt.current
          ? Date.now() - backgroundedAt.current
          : Infinity;

        if (timeInBackground > 60_000) {
          // Run sync in background after a short delay so the UI renders first
          setTimeout(async () => {
            try {
              const { syncAllContacts, hasContactsPermission } = await import('./src/services/contacts');
              const { scheduleBirthdayNotificationsForAll } = await import('./src/services/notifications');

              const hasPermission = await hasContactsPermission();
              if (hasPermission) {
                const { imported, updated } = await syncAllContacts(friends, settings.defaultContactFrequency);
                if (imported > 0 || updated > 0) {
                  console.log(`Contacts synced on foreground: ${imported} imported, ${updated} updated`);
                  await loadFriends();

                  const allFriends = useStore.getState().friends;
                  await scheduleBirthdayNotificationsForAll(allFriends, settings.birthdayReminderTime);
                }
              }
            } catch (error) {
              console.error('Foreground contact sync failed:', error);
            }
          }, 3000);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isInitialized, friends, settings, loadFriends]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.logo}>Lena</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Loading your friends...</Text>
      </View>
    );
  }

  return <Navigation />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 24,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.error,
    textAlign: 'center',
  },
});
