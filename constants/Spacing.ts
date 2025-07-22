/**
 * Picky App Spacing System
 * Consistent spacing values for modern UI design
 */

export const Spacing = {
  // Base unit (8px) following 8pt grid system
  base: 8,

  // Common spacing values
  xs: 4,     // Extra small
  sm: 8,     // Small
  md: 16,    // Medium
  lg: 24,    // Large
  xl: 32,    // Extra large
  xxl: 48,   // Double extra large
  xxxl: 64,  // Triple extra large

  // Layout specific spacing
  layout: {
    screenPadding: 20,        // Main screen padding
    cardPadding: 16,          // Card internal padding
    buttonPadding: 16,        // Button internal padding
    sectionSpacing: 32,       // Between major sections
    itemSpacing: 12,          // Between list items
    componentSpacing: 8,      // Between related components
  },

  // Border radius values
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    round: 9999, // Fully rounded
  },

  // Safe area adjustments
  safeArea: {
    top: 44,      // Status bar + navigation
    bottom: 34,   // Home indicator
    sides: 0,     // Left and right
  },

  // Shadow offsets
  shadow: {
    small: {
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

export type SpacingKeys = keyof typeof Spacing;