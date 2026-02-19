// Navigation Setup for Lena

import React, { useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import QuickLogScreen from '../screens/QuickLogScreen';
import FriendDetailScreen from '../screens/FriendDetailScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ImportContactsScreen from '../screens/ImportContactsScreen';

// Components
import QuickLogModal from '../components/QuickLogModal';
import { useStore } from '../store/useStore';

// Types for navigation
export type RootStackParamList = {
  MainTabs: undefined;
  FriendDetail: { friendId: string; isBirthday?: boolean };
  AddFriend: { friendId?: string; defaultTier?: string } | undefined;
  ImportContacts: undefined;
};

export type TabParamList = {
  Home: undefined;
  Friends: undefined;
  Settings: undefined;
  QuickLog: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar with Liquid Glass Effect - Floating Style
function CustomTabBar(props: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 75 : 70}
        tint="light"
        style={styles.blurContainer}
      >
        {/* Glass tint overlay with gradient effect */}
        <View style={styles.tintOverlay} />
        <BottomTabBar {...props} />
      </BlurView>
    </View>
  );
}

// Tab icon component - using Feather outline icons
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const getIconName = (tabName: string): string => {
    switch (tabName) {
      case 'Home':
        return 'home';
      case 'Friends':
        return 'users';
      case 'Settings':
        return 'settings';
      case 'QuickLog':
        return 'plus';
      default:
        return 'home';
    }
  };

  const iconName = getIconName(name);
  const iconColor = focused ? '#FFFFFF' : colors.textSecondary;

  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}>
      <Feather name={iconName as any} size={22} color={iconColor} />
    </View>
  );
}

// Bottom tabs
function MainTabs() {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const { addInteraction } = useStore();

  const handleQuickLogSave = async (note: string, date: Date, friendId?: string) => {
    if (friendId) {
      await addInteraction(friendId, note, date);
      setShowQuickLog(false);
    }
  };

  const handleCloseQuickLog = () => {
    setShowQuickLog(false);
  };

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Friends"
          component={FriendsScreen}
          options={{ tabBarLabel: 'Friends' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Settings' }}
        />
        <Tab.Screen
          name="QuickLog"
          component={QuickLogScreen}
          options={{ tabBarLabel: 'Log' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowQuickLog(true);
            },
          }}
        />
      </Tab.Navigator>

      <QuickLogModal
        visible={showQuickLog}
        onClose={handleCloseQuickLog}
        onSave={handleQuickLogSave}
      />
    </>
  );
}

// Main navigation
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: typography.weights.semibold,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FriendDetail"
          component={FriendDetailScreen}
          options={{ title: 'Friend' }}
        />
        <Stack.Screen
          name="AddFriend"
          component={AddFriendScreen}
          options={({ route }) => ({
            title: route.params?.friendId ? 'Edit Friend' : 'Add Friend',
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="ImportContacts"
          component={ImportContactsScreen}
          options={{
            title: 'Manage Follow-ups',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Floating container
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    pointerEvents: 'box-none',
  },
  // Liquid Glass Container - Floating pill shape
  blurContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.lg,
    // More transparent glass effect
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.85)',
  },
  // Glass tint overlay with warm sunset gradient
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(217, 133, 59, 0.03)', // Subtle warm golden tint
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 0,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconContainerFocused: {
    backgroundColor: colors.primary,
    // Subtle glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
