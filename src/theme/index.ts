// Lena Design System - Elegant Sunset (Golden Hour)

export const colors = {
  // Backgrounds - Soft cream
  background: '#FEFDFB',   // Almost white with subtle warmth
  card: '#FFF8F3',         // Barely tinted warm card background

  // Primary palette - Golden sunset orange
  primary: '#D9853B',      // Warm golden orange - elegant sunset
  primaryLight: '#F5E6D3', // Very soft golden tint
  primaryDark: '#B8722E',  // Deep sunset gold
  primaryMid: '#E5A05C',   // Soft golden highlight

  // Secondary palette - Sunset amber
  secondary: '#C4956C',    // Dusty amber - sophisticated warmth
  secondaryLight: '#F0E4D7',
  secondaryDark: '#A67A52',

  // Accent - Dusk lavender
  accent: '#9B8FAA',       // Muted lavender - elegant twilight
  accentLight: '#EBE7F0',
  accentDark: '#7D6F8E',

  // Text - Refined browns
  textPrimary: '#3A3330',  // Warm charcoal
  textSecondary: '#8E7F76',
  textLight: '#C4B8B0',

  // Semantic
  success: '#6B9B7C',      // Muted sage green
  warning: '#D9853B',      // Golden orange (consistent)
  error: '#C45D5D',        // Muted burgundy red

  // UI
  border: '#EFE7DF',
  shadow: 'rgba(217, 133, 59, 0.12)',
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
