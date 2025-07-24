import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';

interface ThemedTextProps extends TextProps {
  variant?: keyof typeof Theme.textStyles;
  color?: keyof typeof Theme.colors.text | 'purple' | 'yellow' | string;
  children: React.ReactNode;
}

export default function ThemedText({ 
  variant = 'body', 
  color = 'primary',
  style,
  children,
  ...props 
}: ThemedTextProps) {
  const textStyle = Theme.textStyles[variant];
  
  // Get color from theme or use custom color
  const getTextColor = () => {
    if (typeof color === 'string' && color.startsWith('#')) {
      return color;
    }
    if (color === 'purple') {
      return Theme.colors.primary.purple;
    }
    if (color === 'yellow') {
      return Theme.colors.primary.yellow;
    }
    return Theme.colors.text[color as keyof typeof Theme.colors.text] || Theme.colors.text.primary;
  };
  
  const textColor = getTextColor();

  return (
    <Text 
      style={[
        textStyle,
        { color: textColor },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}