import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components";
import { Post } from "@/types";
import { useAppContext } from "@/contexts/AppContext";

interface BlogListItemProps {
  post: Post;
  onPress: (post: Post) => void;
  onBookmarkPress: (post: Post) => void;
  isBookmarked: boolean;
  showBookmark?: boolean;
}

export default function BlogListItem({
  post,
  onPress,
  onBookmarkPress,
  isBookmarked,
  showBookmark = true,
}: BlogListItemProps) {
  const { themeState } = useAppContext();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.postItemContainer}>
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => onPress(post)}
        activeOpacity={0.7}
      >
        {post.featured_image ? (
          <Image
            source={{ uri: post.featured_image }}
            style={styles.postImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.postImage, styles.postImagePlaceholder]}>
            <ThemedText style={styles.placeholderText}>No Image</ThemedText>
          </View>
        )}
        <View style={styles.postContent}>
          <ThemedText
            variant="primary"
            style={styles.postTitle}
            numberOfLines={3}
          >
            {post.title.rendered.replace(/<[^>]*>/g, "")}
          </ThemedText>
          <ThemedText style={styles.postExcerpt} numberOfLines={2}>
            {post.excerpt.rendered.replace(/<[^>]*>/g, "")}
          </ThemedText>
          <View style={styles.postMeta}>
            {post.author_name && (
              <ThemedText style={styles.postAuthor}>
                {post.author_name}
              </ThemedText>
            )}
            <ThemedText style={styles.postDate}>
              {formatDate(post.date)}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>

      {showBookmark && (
        <TouchableOpacity
          style={[
            styles.bookmarkButton,
            isBookmarked && styles.bookmarkedButtonActive,
          ]}
          onPress={() => onBookmarkPress(post)}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.bookmarkButtonText,
              isBookmarked && {
                ...styles.bookmarkedButtonTextActive,
                color: themeState.isDarkMode ? "#FFD700" : "#FFA500"
              },
            ]}
          >
            {isBookmarked ? "⭐" : "☆"}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postItemContainer: {
    marginBottom: 16,
    position: "relative",
  },
  postItem: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postImage: {
    width: 100,
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  postImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#666",
    fontSize: 12,
  },
  postContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    lineHeight: 20,
  },
  postExcerpt: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 18,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postAuthor: {
    fontSize: 12,
    opacity: 0.6,
  },
  postDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  bookmarkButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookmarkedButtonActive: {
    backgroundColor: "#FFD700",
  },
  bookmarkButtonText: {
    fontSize: 16,
  },
  bookmarkedButtonTextActive: {
    color: "white",
  },
});