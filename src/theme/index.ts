// Lena Design System - Vibrant & Warm

export const colors = {
  // Backgrounds
  background: '#FFFFFF',   // Pure white
  card: '#FFFFFF',

  // Primary palette - Vibrant blue
  primary: '#4A90D9',
  primaryLight: '#7CB3F0',
  primaryDark: '#2B6CB0',

  // Secondary palette - Vibrant pink/coral
  secondary: '#FF6B9D',
  secondaryLight: '#FFB8D1',
  secondaryDark: '#E05086',

  // Accent - Vibrant mint green
  accent: '#34D399',
  accentLight: '#6EE7B7',
  accentDark: '#10B981',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textLight: '#718096',

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',

  // UI
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
