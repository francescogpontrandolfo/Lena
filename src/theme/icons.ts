// Centralized Icon System for Lena
// Uses Feather icons for modern, minimal outline style

import React from 'react';
import { Feather } from '@expo/vector-icons';

// All icon names used in the app (Feather icon set)
export type IconName =
  // Tab bar
  | 'home'
  | 'users'
  | 'settings'
  // Timeline & Status
  | 'gift'
  | 'calendar'
  | 'phone'
  | 'edit-3'
  | 'alert-circle'
  | 'check-circle'
  // Friend detail
  | 'star'
  | 'message-circle'
  | 'edit'
  // Actions
  | 'user-plus'
  | 'search'
  | 'plus'
  | 'trash-2'
  | 'x'
  | 'filter'
  | 'download'
  | 'chevron-right';

// Standardized icon sizes
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 64,
} as const;

export type IconSize = keyof typeof iconSizes;

// Icon component props
interface IconProps {
  name: IconName;
  size?: IconSize | number;
  color?: string;
}

// Centralized Icon component
export const Icon: React.FC<IconProps> = ({ name, size = 'md', color }) => {
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  return <Feather name={name as any} size={iconSize} color={color} />;
};
