// Lena Design System - Electric Blue & Clean

export const colors = {
  // Backgrounds - Clean white
  background: '#FFFFFF',   // Pure white
  card: '#FAFBFC',         // Very subtle off-white for cards

  // Primary palette - Electric blue
  primary: '#0099FF',      // Bright electric blue
  primaryLight: '#E8F4FD', // Light blue for backgrounds (readable)
  primaryDark: '#0077CC',
  primaryMid: '#33B1FF',   // Medium blue for accents

  // Secondary palette - Warm coral/pink
  secondary: '#FF6B9D',    // Vibrant pink
  secondaryLight: '#FFE0EB',
  secondaryDark: '#E55585',

  // Accent - Deep indigo/purple
  accent: '#6366F1',       // Electric indigo
  accentLight: '#EEF0FF',
  accentDark: '#4F46E5',

  // Text - Dark on white background
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  // Semantic
  success: '#0099FF',      // Electric blue (consistent)
  warning: '#F59E0B',      // Amber (readable)
  error: '#EF4444',        // Clear red

  // UI
  border: '#E5E7EB',
  shadow: 'rgba(0, 153, 255, 0.15)',
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
