import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import { ThemedText, ThemedView } from "@/components";
import { BlogList } from "@/components/blog";
import { wordpressApiService, bookmarkService } from "@/services";
import { Post } from "@/types";
import i18nService from "@/services/i18n";
import { useAppContext } from "@/contexts/AppContext";

const { width: screenWidth } = Dimensions.get("window");

export default function HomePage() {
  const { themeState } = useAppContext();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

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

  const fetchData = useCallback(async () => {
    try {
      console.log("HomePage: fetchData invoked");
      setError(null);
      const [featuredData, latestData] = await Promise.all([
        wordpressApiService.getFeaturedPosts(5),
        wordpressApiService.getLatestPosts(10, 1),
      ]);
      console.log("Fetched featured posts:", featuredData);
      setFeaturedPosts(featuredData);
      setLatestPosts(latestData);
      await loadBookmarks();
    } catch (err) {
      setError(i18nService.t("errors.general") || "Failed to load posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: "/post/[id]",
      params: { id: post.id.toString() },
    });
  };

  const renderFeaturedCarousel = () => {
    if (featuredPosts.length === 0) return null;

    return (
      <View style={styles.carouselContainer}>
        <ThemedText variant='primary' style={styles.sectionTitle}>
          {i18nService.t("news.featured") || "Featured Stories"}
        </ThemedText>
        <Carousel
          width={screenWidth - 40}
          height={200}
          style={styles.carousel}
          data={featuredPosts}
          scrollAnimationDuration={1000}
          snapEnabled={true}
          mode='parallax'
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.carouselItem}
              onPress={() => handlePostPress(item)}
              activeOpacity={0.8}
            >
              {item.featured_image ? (
                <Image
                  source={{ uri: item.featured_image }}
                  style={styles.carouselImage}
                  contentFit='cover'
                />
              ) : (
                <View
                  style={[
                    styles.carouselImage,
                    styles.carouselImagePlaceholder,
                  ]}
                >
                  <ThemedText style={styles.placeholderText}>
                    No Image
                  </ThemedText>
                </View>
              )}
              <View style={styles.carouselOverlay}>
                <ThemedText
                  variant='primary'
                  style={styles.carouselTitle}
                  numberOfLines={2}
                >
                  {item.title.rendered.replace(/<[^>]*>/g, "")}
                </ThemedText>
                {item.category_names && item.category_names.length > 0 && (
                  <ThemedText style={styles.carouselCategory}>
                    {item.category_names[0]}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderLatestPosts = () => {
    if (latestPosts.length === 0) return null;

    return (
      <View style={styles.latestContainer}>
        <ThemedText variant='primary' style={styles.sectionTitle}>
          {i18nService.t("news.latest") || "Latest News"}
        </ThemedText>
        <BlogList
          posts={latestPosts}
          bookmarkedIds={bookmarkedIds}
          onPostPress={handlePostPress}
          onBookmarkPress={toggleBookmark}
          contentContainerStyle={styles.blogListContent}
          useFlatList={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <ThemedText style={styles.loadingText}>Loading news...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
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
            {i18nService.t("news.title") || "News Hub"}
          </ThemedText>
        </View>

        {renderFeaturedCarousel()}
        {renderLatestPosts()}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  blogListContent: {
    padding: 0,
  },
  carouselContainer: {
    marginBottom: 30,
  },
  carousel: {
    borderRadius: 12,
    overflow: "hidden",
  },
  carouselItem: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  carouselImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  carouselTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  carouselCategory: {
    color: "white",
    fontSize: 12,
    opacity: 0.9,
  },
  latestContainer: {
    marginBottom: 30,
  },
  postItemContainer: {
    marginBottom: 20,
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
});
