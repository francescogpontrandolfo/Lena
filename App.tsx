// Lena - Friend Relationship Manager
// Main App Entry Point

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { useStore } from './src/store/useStore';
import { colors, typography } from './src/theme';

function AppContent() {
  const { initialize, isLoading, isInitialized } = useStore();
  const [error, setError] = useState<string | null>(null);

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
