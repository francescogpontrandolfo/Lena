// Navigation Setup for Lena

import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import SearchScreen from '../screens/SearchScreen';
import FriendDetailScreen from '../screens/FriendDetailScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ImportContactsScreen from '../screens/ImportContactsScreen';

// Types for navigation
export type RootStackParamList = {
  MainTabs: undefined;
  FriendDetail: { friendId: string; isBirthday?: boolean };
  AddFriend: { friendId?: string } | undefined;
  ImportContacts: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Friends: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar with Liquid Glass Effect - Floating Style
function CustomTabBar(props: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 95 : 80}
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
      case 'Search':
        return 'search';
      case 'Settings':
        return 'settings';
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
  return (
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
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
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
    </Tab.Navigator>
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
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.85)',
  },
  // Glass tint overlay with gradient effect
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 153, 255, 0.04)', // Very subtle electric blue tint
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    paddingTop: spacing.xs,
    paddingBottom: 0,
    paddingHorizontal: spacing.xs,
    elevation: 0,
    height: 64,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  tabBarItem: {
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
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
