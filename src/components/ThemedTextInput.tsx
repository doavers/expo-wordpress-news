import React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps,
  StyleSheet,
  View,
} from "react-native";
import { useAppContext } from "@/contexts/AppContext";
import { ThemedText } from "./ThemedText";

interface ThemedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function ThemedTextInput({
  label,
  error,
  style,
  ...props
}: ThemedTextInputProps) {
  const { themeState } = useAppContext();

  const inputStyle = [
    styles.input,
    {
      color: themeState.colors.text,
      backgroundColor: themeState.colors.card,
      borderColor: error ? themeState.colors.error : themeState.colors.border,
      borderWidth: 1,
    },
    style,
  ];

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <RNTextInput
        style={inputStyle}
        placeholderTextColor={themeState.colors.textSecondary}
        {...props}
      />
      {error && (
        <ThemedText style={[styles.error, { color: themeState.colors.error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 44,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});
