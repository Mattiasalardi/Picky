import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Theme } from '../../constants/Theme';
import ThemedText from './ThemedText';

type ButtonVariant = 'primary' | 'secondary' | 'yellow';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  size = 'medium',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = Theme.components.button[variant];
    const sizeStyle = getSizeStyle();
    
    return [
      baseStyle,
      sizeStyle,
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style,
    ];
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          minHeight: 36,
          paddingHorizontal: Theme.spacing.md,
          paddingVertical: Theme.spacing.sm,
        };
      case 'large':
        return {
          minHeight: 56,
          paddingHorizontal: Theme.spacing.xl,
          paddingVertical: Theme.spacing.lg,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    if (disabled) return Theme.colors.text.quaternary;
    
    switch (variant) {
      case 'primary':
        return Theme.colors.text.primary;
      case 'secondary':
        return Theme.colors.text.primary;
      case 'yellow':
        return Theme.colors.background.primary;
      default:
        return Theme.colors.text.primary;
    }
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'yellow':
        return Theme.colors.background.primary;
      default:
        return Theme.colors.text.primary;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoadingColor()} />
      ) : (
        <ThemedText
          variant="button"
          color={getTextColor()}
          style={styles.buttonText}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});