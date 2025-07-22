/**
 * Picky App Typography System
 * Modern Apple-style typography with Italian character support
 */

import { Platform } from 'react-native';

export const Typography = {
  // Font families - SF Pro on iOS, Roboto on Android
  fonts: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },

  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Font sizes following Apple's Human Interface Guidelines
  sizes: {
    // Display sizes
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,

    // Text sizes
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,

    // Custom app sizes
    hero: 40,
    button: 17,
    tabBar: 10,
  },

  // Line heights for better readability
  lineHeights: {
    largeTitle: 41,
    title1: 34,
    title2: 28,
    title3: 25,
    headline: 22,
    body: 22,
    callout: 21,
    subheadline: 20,
    footnote: 18,
    caption1: 16,
    caption2: 13,
    hero: 48,
  },

  // Letter spacing for better visual hierarchy
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// Pre-defined text styles combining font, size, weight, and spacing
export const TextStyles = {
  // Display styles
  largeTitle: {
    fontFamily: Typography.fonts.primary,
    fontSize: Typography.sizes.largeTitle,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.largeTitle,
    letterSpacing: Typography.letterSpacing.tight,
  },
  
  title1: {
    fontFamily: Typography.fonts.primary,
    fontSize: Typography.sizes.title1,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.title1,
    letterSpacing: Typography.letterSpacing.tight,
  },

  title2: {
    fontFamily: Typography.fonts.primary,
    fontSize: Typography.sizes.title2,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.title2,
    letterSpacing: Typography.letterSpacing.normal,
  },

  title3: {
    fontFamily: Typography.fonts.primary,
    fontSize: Typography.sizes.title3,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.title3,
    letterSpacing: Typography.letterSpacing.normal,
  },

  // Body styles
  headline: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.headline,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.headline,
    letterSpacing: Typography.letterSpacing.normal,
  },

  body: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.body,
    letterSpacing: Typography.letterSpacing.normal,
  },

  bodyBold: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.body,
    letterSpacing: Typography.letterSpacing.normal,
  },

  callout: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.callout,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.callout,
    letterSpacing: Typography.letterSpacing.normal,
  },

  subheadline: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.subheadline,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.subheadline,
    letterSpacing: Typography.letterSpacing.normal,
  },

  footnote: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.footnote,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.footnote,
    letterSpacing: Typography.letterSpacing.normal,
  },

  caption1: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.caption1,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.caption1,
    letterSpacing: Typography.letterSpacing.normal,
  },

  caption2: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.caption2,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.caption2,
    letterSpacing: Typography.letterSpacing.normal,
  },

  // Custom app styles
  hero: {
    fontFamily: Typography.fonts.primary,
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.hero,
    letterSpacing: Typography.letterSpacing.tight,
  },

  button: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.button * 1.2,
    letterSpacing: Typography.letterSpacing.normal,
  },

  tabBar: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.tabBar,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.tabBar * 1.2,
    letterSpacing: Typography.letterSpacing.normal,
  },
} as const;

export type TextStyleKeys = keyof typeof TextStyles;