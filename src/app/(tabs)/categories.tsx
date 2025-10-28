import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { BlogList } from "@/components/blog";
import { wordpressApiService, bookmarkService } from "@/services";
import { Category, Post } from "@/types";
import i18nService from "@/services/i18n";
import { useAppContext } from "@/contexts/AppContext";

export default function CategoriesPage() {
  const { themeState } = useAppContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryPosts, setCategoryPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const categoriesData = await wordpressApiService.getCategories();
      // Filter out empty categories and sort by count (most posts first)
      const filteredCategories = categoriesData
        .filter((cat: Category) => cat.count > 0)
        .sort((a: Category, b: Category) => b.count - a.count);
      setCategories(filteredCategories);
    } catch (err) {
      setError(i18nService.t("errors.general") || "Failed to load categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategoryPosts = useCallback(async (category: Category) => {
    try {
      setPostsLoading(true);
      const posts = await wordpressApiService.getPostsByCategory(
        category.id,
        20,
        1
      );
      setCategoryPosts(posts);
    } catch (err) {
      console.error("Error fetching category posts:", err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    loadBookmarks();
  }, [fetchCategories]);

  useEffect(() => {
    // Subscribe to bookmark changes
    const unsubscribe = bookmarkService.subscribe(() => {
      loadBookmarks();
    });
    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryPosts(category);
  };

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: "/post/[id]",
      params: { id: post.id.toString() },
    });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryPosts([]);
  };

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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <View style={styles.categoryInfo}>
          <ThemedText variant='primary' style={styles.categoryName}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.categoryCount}>
            {item.count} {item.count === 1 ? "article" : "articles"}
          </ThemedText>
        </View>
        <View style={styles.categoryArrow}>
          <ThemedText style={styles.arrowText}>›</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <ThemedText style={styles.loadingText}>
          {i18nService.t("categories.loading") || "Loading categories..."}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.headerTitle}>
            {i18nService.t("categories.title") || "Categories"}
          </ThemedText>
        </View>

        {!selectedCategory ? (
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <ThemedText style={styles.emptyText}>
                  {i18nService.t("categories.empty") ||
                    "No categories available"}
                </ThemedText>
              }
            />
          </View>
        ) : (
          <View style={styles.categoryPostsContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToCategories}
            >
              <ThemedText style={styles.backButtonText}>
                ‹ {i18nService.t("categories.backToCategories")}
              </ThemedText>
            </TouchableOpacity>

            <ThemedText variant='primary' style={styles.selectedCategoryName}>
              {selectedCategory.name}
            </ThemedText>
            <ThemedText style={styles.selectedCategoryCount}>
              {selectedCategory.count}{" "}
              {selectedCategory.count === 1 ? "article" : "articles"}
            </ThemedText>

            <BlogList
              posts={categoryPosts}
              bookmarkedIds={bookmarkedIds}
              loading={postsLoading}
              onPostPress={handlePostPress}
              onBookmarkPress={toggleBookmark}
              contentContainerStyle={styles.categoryBlogListContent}
              useFlatList={false}
              ListEmptyComponent={() => (
                <ThemedView style={styles.categoryEmptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    {i18nService.t("categories.no_posts") ||
                      "No posts in this category"}
                  </ThemedText>
                </ThemedView>
              )}
            />
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
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryItem: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  categoryArrow: {
    padding: 5,
  },
  arrowText: {
    fontSize: 20,
    opacity: 0.5,
  },
  categoryPostsContainer: {
    flex: 1,
  },
  backButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedCategoryName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  selectedCategoryCount: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 20,
  },
  categoryBlogListContent: {
    padding: 0,
  },
  categoryEmptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  postsLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  postsLoadingText: {
    marginLeft: 10,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#FF3B30",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    opacity: 0.6,
    marginTop: 20,
  },
});
