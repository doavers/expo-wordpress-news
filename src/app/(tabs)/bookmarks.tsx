import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, ThemedView } from "@/components";
import { Post, Bookmark } from "@/types";
import { bookmarkService } from "@/services";
import i18nService from "@/services/i18n";
import { useAppContext } from "@/contexts/AppContext";

export default function BookmarksPage() {
  const { themeState } = useAppContext();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const bookmarksData = await bookmarkService.getBookmarks();
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBookmarks();
    }, [])
  );

  useEffect(() => {
    // Subscribe to bookmark changes
    const unsubscribe = bookmarkService.subscribe(() => {
      loadBookmarks();
    });
    return unsubscribe;
  }, []);

  const removeBookmark = (postId: number) => {
    Alert.alert(
      "Remove Bookmark",
      "Are you sure you want to remove this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await bookmarkService.removeBookmark(postId);
            } catch (error) {
              console.error("Error removing bookmark:", error);
              Alert.alert("Error", "Failed to remove bookmark");
            }
          },
        },
      ]
    );
  };

  const clearAllBookmarks = () => {
    Alert.alert(
      "Clear All Bookmarks",
      "Are you sure you want to remove all bookmarks? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await bookmarkService.clearAllBookmarks();
            } catch (error) {
              console.error("Error clearing bookmarks:", error);
              Alert.alert("Error", "Failed to clear bookmarks");
            }
          },
        },
      ]
    );
  };

  const handlePostPress = (bookmark: Bookmark) => {
    router.push({
      pathname: "/post/[id]",
      params: { id: bookmark.id.toString() },
    });
  };

  const handleNotificationPress = () => {
    router.push("/notifications/history");
  };

  const renderBookmarkItem = (bookmark: Bookmark) => (
    <View key={bookmark.id} style={styles.bookmarkItem}>
      <TouchableOpacity
        style={styles.postContent}
        onPress={() => handlePostPress(bookmark)}
        activeOpacity={0.7}
      >
        {bookmark.featured_image ? (
          <Image
            source={{ uri: bookmark.featured_image }}
            style={styles.postImage}
            contentFit='cover'
          />
        ) : (
          <View style={[styles.postImage, styles.postImagePlaceholder]}>
            <ThemedText style={styles.placeholderText}>No Image</ThemedText>
          </View>
        )}
        <View style={styles.postDetails}>
          <ThemedText
            variant='primary'
            style={styles.postTitle}
            numberOfLines={3}
          >
            {bookmark.title}
          </ThemedText>
          <ThemedText style={styles.postExcerpt} numberOfLines={2}>
            {bookmark.excerpt.replace(/<[^>]*>/g, "")}
          </ThemedText>
          <View style={styles.postMeta}>
            {bookmark.author_name && (
              <ThemedText style={styles.postAuthor}>
                {bookmark.author_name}
              </ThemedText>
            )}
            <ThemedText style={styles.postDate}>
              Bookmarked {new Date(bookmark.bookmarked_date).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeBookmark(bookmark.id)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.removeButtonText}>×</ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <ThemedText style={styles.loadingText}>Loading bookmarks...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <ThemedText variant='primary' style={styles.headerTitle}>
              {i18nService.t("bookmarks.title") || "Bookmarks"}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {bookmarks.length}{" "}
              {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={themeState.colors.text}
            />
          </TouchableOpacity>
        </View>

        {bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📚</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Bookmarks Yet</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Start bookmarking your favorite articles to read them later!
            </ThemedText>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/")}
            >
              <ThemedText style={styles.browseButtonText}>
                Browse Articles
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookmarksContainer}>
            {bookmarks.length > 1 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={clearAllBookmarks}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.clearAllButtonText}>
                  {i18nService.t("bookmarks.clearAll")}
                </ThemedText>
              </TouchableOpacity>
            )}

            {bookmarks.map(renderBookmarkItem)}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  headerTextContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  bookmarksContainer: {
    flex: 1,
  },
  bookmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postContent: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
  },
  postImage: {
    width: 80,
    height: 80,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginRight: 12,
  },
  postImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#666",
    fontSize: 12,
  },
  postDetails: {
    flex: 1,
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
  removeButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: 20,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  clearAllButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  clearAllButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
