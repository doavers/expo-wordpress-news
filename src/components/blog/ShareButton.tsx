import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components";

interface ShareButtonProps {
  onPress: () => void;
  variant?: "bottom" | "top";
}

export default function ShareButton({
  onPress,
  variant = "bottom",
}: ShareButtonProps) {
  const buttonStyle = variant === "bottom"
    ? [styles.actionButton, styles.shareButton]
    : [styles.topActionButton, styles.topShareButton];

  const textStyle = variant === "bottom"
    ? styles.actionButtonText
    : styles.topActionButtonText;

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <ThemedText style={textStyle}>🔗 Share</ThemedText>
    </TouchableOpacity>
  );
}

// Using the same styles as the original bottom buttons
const styles = StyleSheet.create({
  // Bottom button styles (original)
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#5856D6",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Top button styles (for future use if needed)
  topActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  topActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  topShareButton: {
    backgroundColor: "transparent",
    borderColor: "#007AFF",
  },
});