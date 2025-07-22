/**
 * Picky App Theme
 * Complete theme configuration combining colors, typography, and spacing
 */

import { Colors } from './Colors';
import { Typography, TextStyles } from './Typography';
import { Spacing } from './Spacing';

export const Theme = {
  colors: {
    ...Colors,
    // Add missing color structures for consistency
    primary: {
      main: Colors.primary.purple,
      light: Colors.primary.purpleLight,
      dark: Colors.primary.purpleDark,
    },
    secondary: {
      main: Colors.primary.yellow,
      light: Colors.primary.yellowLight, 
      dark: Colors.primary.yellowDark,
    },
  },
  typography: Typography,
  textStyles: TextStyles,
  spacing: Spacing,

  // Animation durations
  animation: {
    fast: 200,
    medium: 300,
    slow: 500,
    verySlow: 800,
  },

  // Common component styles
  components: {
    card: {
      backgroundColor: Colors.background.tertiary,
      borderRadius: Spacing.radius.md,
      padding: Spacing.layout.cardPadding,
      shadowColor: Colors.ui.shadow,
      ...Spacing.shadow.medium,
    },
    
    button: {
      primary: {
        backgroundColor: Colors.primary.purple,
        borderRadius: Spacing.radius.md,
        paddingHorizontal: Spacing.layout.buttonPadding,
        paddingVertical: Spacing.md,
        minHeight: 48,
      },
      secondary: {
        backgroundColor: Colors.interactive.buttonSecondary,
        borderRadius: Spacing.radius.md,
        paddingHorizontal: Spacing.layout.buttonPadding,
        paddingVertical: Spacing.md,
        minHeight: 48,
        borderWidth: 1,
        borderColor: Colors.ui.cardBorder,
      },
      yellow: {
        backgroundColor: Colors.primary.yellow,
        borderRadius: Spacing.radius.md,
        paddingHorizontal: Spacing.layout.buttonPadding,
        paddingVertical: Spacing.md,
        minHeight: 48,
      },
    },

    input: {
      backgroundColor: Colors.background.secondary,
      borderRadius: Spacing.radius.md,
      borderWidth: 1,
      borderColor: Colors.ui.inputBorder,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      minHeight: 48,
    },

    modal: {
      backgroundColor: Colors.background.elevated,
      borderRadius: Spacing.radius.lg,
      padding: Spacing.lg,
      shadowColor: Colors.ui.shadow,
      ...Spacing.shadow.large,
    },
  },

  // Screen layouts
  screens: {
    container: {
      flex: 1,
      backgroundColor: Colors.background.primary,
    },
    
    content: {
      flex: 1,
      paddingHorizontal: Spacing.layout.screenPadding,
    },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.layout.screenPadding,
    },
  },
} as const;

export type ThemeType = typeof Theme;

// Export individual components for convenience
export { Colors, Typography, TextStyles, Spacing };