import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'card';
}

export function ThemedView({ style, variant = 'primary', ...props }: ThemedViewProps) {
  const { themeState } = useAppContext();

  const backgroundColor = variant === 'primary'
    ? themeState.colors.background
    : themeState.colors.card;

  return (
    <View
      style={[{ backgroundColor }, styles.view, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
});