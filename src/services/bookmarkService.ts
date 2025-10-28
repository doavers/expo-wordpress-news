import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post, Bookmark } from "@/types";

const BOOKMARKS_KEY = "@news_app_bookmarks";

class BookmarkService {
  private listeners: Array<() => void> = [];

  // Subscribe to bookmark changes
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of bookmark changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Get all bookmarks (new format with full URLs)
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const storedBookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (!storedBookmarks) return [];

      const bookmarks = JSON.parse(storedBookmarks);

      // Migrate old Post bookmarks to new Bookmark format
      const migratedBookmarks = bookmarks.map((bookmark: any) => {
        if (bookmark.content) {
          // This is an old Post format, convert to Bookmark
          return this.convertPostToBookmark(bookmark);
        }
        return bookmark;
      });

      // Save migrated bookmarks if any changes were made
      if (JSON.stringify(migratedBookmarks) !== JSON.stringify(bookmarks)) {
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(migratedBookmarks));
      }

      return migratedBookmarks;
    } catch (error) {
      console.error("Error getting bookmarks:", error);
      return [];
    }
  }

  // Helper method to convert Post to Bookmark format
  private convertPostToBookmark(post: Post): Bookmark {
    return {
      id: post.id,
      title: post.title.rendered.replace(/<[^>]*>/g, ""),
      excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, ""),
      featured_image: post.featured_image,
      author_name: post.author_name,
      category_names: post.category_names,
      date: post.date,
      link: post.link, // Save the full URL
      bookmarked_date: new Date().toISOString(),
    };
  }

  // Get bookmarked post IDs
  async getBookmarkedIds(): Promise<Set<number>> {
    const bookmarks = await this.getBookmarks();
    return new Set(bookmarks.map(bookmark => bookmark.id));
  }

  // Check if a post is bookmarked
  async isBookmarked(postId: number): Promise<boolean> {
    const bookmarkedIds = await this.getBookmarkedIds();
    return bookmarkedIds.has(postId);
  }

  // Toggle bookmark status for a post
  async toggleBookmark(post: Post): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      const isBookmarked = bookmarks.some(bookmark => bookmark.id === post.id);

      let newBookmarks: Bookmark[];
      if (isBookmarked) {
        newBookmarks = bookmarks.filter(bookmark => bookmark.id !== post.id);
      } else {
        const bookmark: Bookmark = this.convertPostToBookmark(post);
        newBookmarks = [bookmark, ...bookmarks];
      }

      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      this.notifyListeners();
      return !isBookmarked;
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      throw error;
    }
  }

  // Remove a specific bookmark
  async removeBookmark(postId: number): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const newBookmarks = bookmarks.filter(bookmark => bookmark.id !== postId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      this.notifyListeners();
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }
  }

  // Clear all bookmarks
  async clearAllBookmarks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BOOKMARKS_KEY);
      this.notifyListeners();
    } catch (error) {
      console.error("Error clearing bookmarks:", error);
      throw error;
    }
  }

  // Add a bookmark
  async addBookmark(post: Post): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const isBookmarked = bookmarks.some(bookmark => bookmark.id === post.id);

      if (!isBookmarked) {
        const bookmark: Bookmark = this.convertPostToBookmark(post);
        const newBookmarks = [bookmark, ...bookmarks];
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      throw error;
    }
  }

  // Get bookmark by ID
  async getBookmarkById(postId: number): Promise<Bookmark | null> {
    try {
      const bookmarks = await this.getBookmarks();
      return bookmarks.find(bookmark => bookmark.id === postId) || null;
    } catch (error) {
      console.error("Error getting bookmark by ID:", error);
      return null;
    }
  }

  // Get bookmark URL for external access
  async getBookmarkUrl(postId: number): Promise<string | null> {
    try {
      const bookmark = await this.getBookmarkById(postId);
      return bookmark?.link || null;
    } catch (error) {
      console.error("Error getting bookmark URL:", error);
      return null;
    }
  }
}

export const bookmarkService = new BookmarkService();