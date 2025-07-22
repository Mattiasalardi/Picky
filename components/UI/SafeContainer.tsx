import React from 'react';
import { SafeAreaView, View, ViewProps, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';

interface SafeContainerProps extends ViewProps {
  children: React.ReactNode;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  background?: keyof typeof Theme.colors.background;
}

export default function SafeContainer({ 
  children, 
  style,
  edges = ['top', 'bottom'],
  background = 'primary',
  ...props 
}: SafeContainerProps) {
  const backgroundColor = Theme.colors.background[background];
  
  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  // For now, we'll use SafeAreaView. In a production app, you might want
  // to use react-native-safe-area-context for more granular control
  return (
    <SafeAreaView style={containerStyle} {...props}>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});