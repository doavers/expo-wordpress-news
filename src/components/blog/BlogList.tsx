import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ThemedText, ThemedView } from "@/components";
import BlogListItem from "./BlogListItem";
import { Post } from "@/types";

interface BlogListProps {
  posts: Post[];
  bookmarkedIds: Set<number>;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onPostPress: (post: Post) => void;
  onBookmarkPress: (post: Post) => void;
  showBookmark?: boolean;
  ListEmptyComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
  ListHeaderComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
  contentContainerStyle?: any;
  useFlatList?: boolean; // New prop to control whether to use FlatList
}

export default function BlogList({
  posts,
  bookmarkedIds,
  loading = false,
  refreshing = false,
  onRefresh,
  onPostPress,
  onBookmarkPress,
  showBookmark = true,
  ListEmptyComponent,
  ListHeaderComponent,
  contentContainerStyle,
  useFlatList = true,
}: BlogListProps) {
  const renderPostItem = ({ item }: { item: Post }) => (
    <BlogListItem
      post={item}
      onPress={onPostPress}
      onBookmarkPress={onBookmarkPress}
      isBookmarked={bookmarkedIds.has(item.id)}
      showBookmark={showBookmark}
    />
  );

  if (loading && posts.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <ThemedText style={styles.loadingText}>Loading posts...</ThemedText>
      </ThemedView>
    );
  }

  const renderPostList = () => {
    if (posts.length === 0) {
      return ListEmptyComponent ? (
        React.isValidElement(ListEmptyComponent) ? (
          ListEmptyComponent
        ) : (
          React.createElement(ListEmptyComponent as React.ComponentType<any>)
        )
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No posts available</ThemedText>
        </ThemedView>
      );
    }

    return posts.map((post) => (
      <View key={post.id}>{renderPostItem({ item: post })}</View>
    ));
  };

  if (useFlatList) {
    return (
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
          ListEmptyComponent={ListEmptyComponent}
          ListHeaderComponent={ListHeaderComponent}
        />
      </View>
    );
  }

  // Non-FlatList version (for use inside ScrollView)
  return (
    <View style={[styles.container, contentContainerStyle]}>
      {ListHeaderComponent &&
        (React.isValidElement(ListHeaderComponent)
          ? ListHeaderComponent
          : React.createElement(
              ListHeaderComponent as React.ComponentType<any>
            ))}
      {renderPostList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
});
