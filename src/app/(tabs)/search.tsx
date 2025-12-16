import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, ThemedView, ThemedTextInput } from "@/components";
import { BlogList } from "@/components/blog";
import { wordpressApiService, bookmarkService } from "@/services";
import { Post } from "@/types";
import i18nService from "@/services/i18n";
import { useAppContext } from "@/contexts/AppContext";

export default function SearchPage() {
  const { themeState } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const loadBookmarks = async () => {
    try {
      const ids = await bookmarkService.getBookmarkedIds();
      setBookmarkedIds(ids);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const toggleBookmark = async (post: Post) => {
    try {
      const isNowBookmarked = await bookmarkService.toggleBookmark(post);

      if (isNowBookmarked) {
        Alert.alert(
          "Bookmark Added",
          "This post has been added to your bookmarks."
        );
      } else {
        Alert.alert(
          "Bookmark Removed",
          "This post has been removed from your bookmarks."
        );
      }

      // Update local state immediately
      const newBookmarkedIds = new Set(bookmarkedIds);
      if (isNowBookmarked) {
        newBookmarkedIds.add(post.id);
      } else {
        newBookmarkedIds.delete(post.id);
      }
      setBookmarkedIds(newBookmarkedIds);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update bookmark. Please try again.");
    }
  };

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await wordpressApiService.searchPosts(
        searchQuery.trim(),
        20,
        1
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        i18nService.t("search.error") || "Error searching. Please try again."
      );
      console.error("Error searching posts:", err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    performSearch();
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: "/post/[id]",
      params: { id: post.id.toString() },
    });
  };

  const handleSubmitEditing = () => {
    handleSearch();
  };

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

  const renderSearchResults = () => {
    if (searching) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size='large'
            color={themeState.colors.tabBarActive}
          />
          <ThemedText style={styles.stateText}>
            {i18nService.t("search.loading")}
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <ThemedText
            style={[styles.stateText, { color: themeState.colors.error }]}
          >
            {error}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: themeState.colors.tabBarActive },
            ]}
            onPress={handleSearch}
          >
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons
            name='search-outline'
            size={64}
            color={themeState.colors.textSecondary}
          />
          <ThemedText style={styles.stateText}>
            {i18nService.t("search.noResults")}
          </ThemedText>
          <ThemedText style={styles.subText}>
            Try different keywords or check spelling
          </ThemedText>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <BlogList
          posts={searchResults}
          bookmarkedIds={bookmarkedIds}
          onPostPress={handlePostPress}
          onBookmarkPress={toggleBookmark}
          contentContainerStyle={styles.blogListContent}
          useFlatList={false}
        />
      );
    }

    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant='primary' style={styles.headerTitle}>
          {i18nService.t("search.title")}
        </ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <ThemedTextInput
            style={styles.searchInput}
            placeholder={i18nService.t("search.placeholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType='search'
            clearButtonMode='while-editing'
            autoCapitalize='none'
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Ionicons
                name='close-circle'
                size={20}
                color={themeState.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.searchButton,
            {
              backgroundColor: searchQuery.trim()
                ? themeState.colors.tabBarActive
                : themeState.colors.border,
            },
          ]}
          onPress={handleSearch}
          disabled={!searchQuery.trim() || searching}
        >
          <Ionicons
            name='search'
            size={20}
            color={
              searchQuery.trim() && !searching
                ? "white"
                : themeState.colors.textSecondary
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSearchResults()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    position: "relative",
  },
  searchInput: {
    paddingRight: 40, // Space for clear button
  },
  clearButton: {
    position: "absolute",
    right: 5,
    top: "50%",
    marginTop: -21,
    paddingVertical: 3,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  blogListContent: {
    padding: 0,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  stateText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});
