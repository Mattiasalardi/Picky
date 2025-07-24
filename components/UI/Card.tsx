import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof Theme.spacing | number;
  radius?: keyof typeof Theme.spacing.radius | number;
  elevated?: boolean;
}

export default function Card({ 
  children, 
  style,
  padding = 'md',
  radius = 'md',
  elevated = true,
  ...props 
}: CardProps) {
  const getPadding = () => {
    if (typeof padding === 'number') return padding;
    return Theme.spacing[padding] || Theme.spacing.md;
  };

  const getRadius = () => {
    if (typeof radius === 'number') return radius;
    return Theme.spacing.radius[radius] || Theme.spacing.radius.md;
  };

  const cardStyle = [
    styles.card,
    {
      padding: getPadding(),
      borderRadius: getRadius(),
    },
    elevated && styles.elevated,
    style,
  ] as any;

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.background.tertiary,
  },
  elevated: {
    shadowColor: Theme.colors.ui.shadow,
    shadowOffset: Theme.spacing.shadow.medium.shadowOffset,
    shadowOpacity: 0.25,
    shadowRadius: Theme.spacing.shadow.medium.shadowRadius,
    elevation: Theme.spacing.shadow.medium.elevation,
  },
});