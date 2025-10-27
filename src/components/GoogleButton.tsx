import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface GoogleButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GoogleButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}: GoogleButtonProps) {
  const handlePress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.buttonDisabled,
        loading && styles.buttonLoading,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>G</Text>
        </View>
        <ThemedText
          style={[styles.text, (disabled || loading) && styles.textDisabled]}
        >
          {loading ? "Signing in..." : title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dadce0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285f4",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c4043",
  },
  textDisabled: {
    opacity: 0.7,
  },
});
