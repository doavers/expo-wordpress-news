import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onPress: () => void;
  variant?: "bottom" | "top";
}

export default function BookmarkButton({
  isBookmarked,
  onPress,
  variant = "bottom",
}: BookmarkButtonProps) {
  const buttonStyle = variant === "bottom"
    ? [styles.actionButton, isBookmarked ? styles.bookmarkedButton : styles.bookmarkButton]
    : [styles.topActionButton, styles.topBookmarkButton, isBookmarked ? styles.topBookmarkedButton : null];

  const textStyle = variant === "bottom"
    ? [styles.actionButtonText, isBookmarked && styles.bookmarkedButtonText]
    : [styles.topActionButtonText, isBookmarked && styles.topBookmarkedButtonText];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <ThemedText style={textStyle}>
        {isBookmarked ? "✓ Bookmarked" : "⭐ Bookmark"}
      </ThemedText>
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
  bookmarkButton: {
    backgroundColor: "#007AFF",
  },
  bookmarkedButton: {
    backgroundColor: "#34C759",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  bookmarkedButtonText: {
    color: "white",
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
  topBookmarkButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  topBookmarkedButton: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  topBookmarkedButtonText: {
    color: "white",
  },
});