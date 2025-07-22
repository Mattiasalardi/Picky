/**
 * Picky App Color Palette
 * Modern Apple-style design with dark background, purple and yellow accents
 */

export const Colors = {
  // Primary palette
  primary: {
    purple: '#8B5FBF',      // Main purple accent
    purpleLight: '#A477D4',  // Lighter purple for highlights
    purpleDark: '#6B4C93',   // Darker purple for depth
    yellow: '#FFD60A',       // Vibrant yellow accent
    yellowLight: '#FFEA4A',  // Lighter yellow for highlights
    yellowDark: '#E6C200',   // Darker yellow for depth
  },

  // Background colors
  background: {
    primary: '#1C1C1E',      // Main dark background
    secondary: '#2C2C2E',    // Slightly lighter dark sections
    tertiary: '#3A3A3C',     // Cards and elevated surfaces
    elevated: '#48484A',     // Modal overlays and elevated content
  },

  // Text colors
  text: {
    primary: '#FFFFFF',      // Primary white text
    secondary: '#EBEBF5',    // Slightly dimmed white
    tertiary: '#EBEBF599',   // More dimmed (60% opacity)
    quaternary: '#EBEBF54D', // Very dimmed (30% opacity)
    purple: '#A477D4',       // Purple text accent
    yellow: '#FFD60A',       // Yellow text accent
  },

  // System colors
  system: {
    success: '#30D158',      // Green for success states
    warning: '#FF9F0A',      // Orange for warnings
    error: '#FF453A',        // Red for errors
    info: '#007AFF',         // Blue for information
  },

  // UI elements
  ui: {
    separator: '#38383A',    // Dividers and borders
    tabBarActive: '#8B5FBF', // Active tab color (purple)
    tabBarInactive: '#8E8E93', // Inactive tab color
    cardBorder: '#48484A',   // Card borders
    inputBorder: '#48484A',  // Input field borders
    shadow: '#00000080',     // Shadow color (50% opacity)
  },

  // Gradients
  gradients: {
    purpleToYellow: ['#8B5FBF', '#FFD60A'],
    purpleToDark: ['#8B5FBF', '#1C1C1E'],
    yellowToDark: ['#FFD60A', '#1C1C1E'],
    card: ['#2C2C2E', '#1C1C1E'],
  },

  // Interactive states
  interactive: {
    buttonPrimary: '#8B5FBF',
    buttonPrimaryPressed: '#6B4C93',
    buttonSecondary: '#2C2C2E',
    buttonSecondaryPressed: '#3A3A3C',
    buttonYellow: '#FFD60A',
    buttonYellowPressed: '#E6C200',
    overlay: '#00000080',
  },
} as const;

// Type-safe color access
export type ColorKeys = keyof typeof Colors;
export type ColorPalette = typeof Colors;