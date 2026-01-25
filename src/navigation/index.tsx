// Navigation Setup for Lena

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
  Friends: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar with Liquid Glass Effect
function CustomTabBar(props: any) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={Platform.OS === 'ios' ? 80 : 60}
      tint="light"
      style={[
        styles.blurContainer,
        {
          height: 56 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {/* Warm tint overlay */}
      <View style={styles.tintOverlay} />
      <BottomTabBar {...props} />
    </BlurView>
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
      default:
        return 'home';
    }
  };

  const iconName = getIconName(name);
  const iconColor = focused ? colors.primary : colors.textSecondary;

  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}>
      <Feather name={iconName as any} size={24} color={iconColor} />
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
            title: 'Import from Contacts',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Liquid Glass Container
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.md,
    overflow: 'hidden',
  },
  // Warm tint overlay for glass effect
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 249, 245, 0.4)', // Subtle warm cream tint
  },
  tabBar: {
    backgroundColor: 'transparent', // Transparent to show blur
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconContainerFocused: {
    backgroundColor: colors.primaryLight + '40',
  },
});
