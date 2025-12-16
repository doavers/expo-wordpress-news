import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { ThemedText, ThemedView, HTMLRenderer } from "@/components";
import { BookmarkButton, ShareButton } from "@/components/blog";
import { wordpressApiService, bookmarkService } from "@/services";
import { Post, Bookmark } from "@/types";

export default function PostDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [useBookmarkFallback, setUseBookmarkFallback] = useState(false);

  const checkBookmarkStatus = async (postId: number) => {
    try {
      const bookmarked = await bookmarkService.isBookmarked(postId);
      setIsBookmarked(bookmarked);

      // Also get the bookmark data for fallback
      if (bookmarked) {
        const bookmarkData = await bookmarkService.getBookmarkById(postId);
        setBookmark(bookmarkData);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  useEffect(() => {
    if (id) {
      loadPost(parseInt(id, 10));
      checkBookmarkStatus(parseInt(id, 10));
    }
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        checkBookmarkStatus(parseInt(id, 10));
      }
    }, [id])
  );

  useEffect(() => {
    // Subscribe to bookmark changes
    const unsubscribe = bookmarkService.subscribe(() => {
      if (id) {
        checkBookmarkStatus(parseInt(id, 10));
      }
    });
    return unsubscribe;
  }, [id]);

  const loadPost = async (postId: number) => {
    try {
      const postData = await wordpressApiService.getPostById(postId);
      setPost(postData);
    } catch (error) {
      console.error("Error loading post:", error);

      // Check if we have a bookmark with full URL as fallback
      const bookmarkData = await bookmarkService.getBookmarkById(postId);
      if (bookmarkData && bookmarkData.link) {
        setUseBookmarkFallback(true);
        Alert.alert(
          "Source Changed",
          "The original source is not available, but you can access this article through the saved link.",
          [
            { text: "OK", style: "cancel" },
            {
              text: "Open Original",
              onPress: () => openBookmarkLink(bookmarkData.link),
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to load the post. Please try again.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const openBookmarkLink = async (url: string) => {
    if (/^https?:\/\//i.test(url)) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Cannot open this link.");
        }
      } catch (e) {
        console.error("Failed to open URL:", e);
        Alert.alert("Error", "Failed to open the link.");
      }
    } else {
      Alert.alert("Error", "Invalid URL format.");
    }
  };

  const toggleBookmark = async () => {
    if (!post) return;

    try {
      const isNowBookmarked = await bookmarkService.toggleBookmark(post);
      setIsBookmarked(isNowBookmarked);

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
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update bookmark. Please try again.");
    }
  };

  const sharePost = async () => {
    const title =
      post?.title.rendered.replace(/<[^>]*>/g, "") || bookmark?.title || "";
    const url = post?.link || bookmark?.link || "";

    if (!title || !url) return;

    try {
      await Share.share({
        message: title,
        url: url,
      });
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <ThemedText style={styles.loadingText}>Loading post...</ThemedText>
      </ThemedView>
    );
  }

  if (!post && !bookmark) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Post not found</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // If we're using bookmark fallback, show a simplified view
  if (useBookmarkFallback && bookmark) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with featured image */}
          <View style={styles.imageContainer}>
            <Image
              source={
                bookmark.featured_image
                  ? { uri: bookmark.featured_image }
                  : require("../../../assets/image-not-available.png")
              }
              style={styles.featuredImage}
              contentFit='cover'
            />
            <TouchableOpacity
              style={styles.backOverlay}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backIcon}>‹</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Title and metadata */}
            <View style={styles.headerContent}>
              <ThemedText variant='primary' style={styles.title}>
                {bookmark.title}
              </ThemedText>

              <View style={styles.metadata}>
                {bookmark.author_name && (
                  <ThemedText style={styles.author}>
                    By {bookmark.author_name}
                  </ThemedText>
                )}
                <ThemedText style={styles.date}>
                  {formatDate(bookmark.date)}
                </ThemedText>
                {bookmark.category_names &&
                  bookmark.category_names.length > 0 && (
                    <View style={styles.categories}>
                      {bookmark.category_names.map((category, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <ThemedText style={styles.categoryText}>
                            {category}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
              </View>
            </View>

            {/* Content */}
            <View style={styles.postContent}>
              <ThemedText style={styles.contentText}>
                {bookmark.excerpt.replace(/&nbsp;/g, " ")}
              </ThemedText>
              <ThemedText style={styles.fallbackNotice}>
                This is a saved bookmark. The full content is no longer
                available from the original source.
              </ThemedText>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <BookmarkButton
                isBookmarked={isBookmarked}
                onPress={toggleBookmark}
                variant='bottom'
              />
              <ShareButton onPress={sharePost} variant='bottom' />
            </View>

            {/* Link to original post */}
            <TouchableOpacity
              style={styles.originalLink}
              onPress={() => openBookmarkLink(bookmark.link)}
            >
              <ThemedText style={styles.originalLinkText}>
                View Original Post →
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with featured image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              post?.featured_image
                ? { uri: post?.featured_image }
                : require("../../../assets/image-not-available.png")
            }
            style={styles.featuredImage}
            contentFit='cover'
          />
          <TouchableOpacity
            style={styles.backOverlay}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backIcon}>‹</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title and metadata */}
          <View style={styles.headerContent}>
            <ThemedText variant='primary' style={styles.title}>
              {(post?.title?.rendered ?? "").replace(/<[^>]*>/g, "")}
            </ThemedText>

            <View style={styles.metadata}>
              {post?.author_name && (
                <ThemedText style={styles.author}>
                  By {post?.author_name}
                </ThemedText>
              )}
              <ThemedText style={styles.date}>
                {formatDate(post?.date ?? "")}
              </ThemedText>
              {post?.category_names &&
                (post.category_names as string[]).length > 0 && (
                  <View style={styles.categories}>
                    {(post.category_names as string[]).map(
                      (category, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <ThemedText style={styles.categoryText}>
                            {category}
                          </ThemedText>
                        </View>
                      )
                    )}
                  </View>
                )}
            </View>
          </View>

          {/* Top Action Buttons */}
          <View style={styles.topActions}>
            <BookmarkButton
              isBookmarked={isBookmarked}
              onPress={toggleBookmark}
              variant='bottom'
            />
            <ShareButton onPress={sharePost} variant='bottom' />
          </View>

          {/* Content */}
          <View style={styles.postContent}>
            <HTMLRenderer
              htmlContent={post?.content?.rendered ?? ""}
              style={styles.contentText}
            />
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <BookmarkButton
              isBookmarked={isBookmarked}
              onPress={toggleBookmark}
              variant='bottom'
            />
            <ShareButton onPress={sharePost} variant='bottom' />
          </View>

          {/* Link to original post */}
          <TouchableOpacity
            style={styles.originalLink}
            onPress={() => {
              const url = post?.link ?? bookmark?.link ?? "";
              if (!url) return;
              Alert.alert(
                "External Link",
                "This will open the original blog post in your browser.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Open",
                    onPress: async () => {
                      if (/^https?:\/\//i.test(url)) {
                        try {
                          const canOpen = await Linking.canOpenURL(url);
                          if (canOpen) {
                            await Linking.openURL(url);
                          } else {
                            router.push(url as any);
                          }
                        } catch (e) {
                          console.error("Failed to open URL:", e);
                        }
                      } else {
                        router.push(url as any);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <ThemedText style={styles.originalLinkText}>
              View Original Post →
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  imageContainer: {
    height: 250,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  backOverlay: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  headerContent: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    marginBottom: 15,
  },
  metadata: {
    marginBottom: 15,
  },
  author: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    opacity: 0.8,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 10,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "rgba(0,122,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  topActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 0,
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  postContent: {
    marginBottom: 30,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  fallbackNotice: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: 15,
    padding: 15,
    backgroundColor: "rgba(255,165,0,0.1)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FFA500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  originalLink: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
  },
  originalLinkText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
});
