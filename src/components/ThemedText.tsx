import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary';
}

export function ThemedText({ style, variant = 'primary', ...props }: ThemedTextProps) {
  const { themeState } = useAppContext();

  const color = variant === 'primary'
    ? themeState.colors.text
    : themeState.colors.textSecondary;

  return (
    <Text
      style={[{ color }, styles.text, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});