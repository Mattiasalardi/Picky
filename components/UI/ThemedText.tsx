import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Theme, TextStyleKeys } from '../../constants/Theme';

interface ThemedTextProps extends TextProps {
  variant?: TextStyleKeys;
  color?: keyof typeof Theme.colors.text | string;
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
  const textColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : Theme.colors.text[color as keyof typeof Theme.colors.text] || Theme.colors.text.primary;

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