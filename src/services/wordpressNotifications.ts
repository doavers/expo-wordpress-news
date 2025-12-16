import { wordpressApiService } from "./wordpress";
import { notificationService } from "./notifications";
import { pushNotificationService } from "./pushNotification";
import { notificationPreferencesService } from "./notificationPreferences";
import {
  NotificationData,
  NotificationPreferences,
} from "@/types/notifications";
import {
  NOTIFICATION_TEMPLATES,
  NOTIFICATION_ERRORS,
} from "@/constants/notifications";
import {
  logNotificationEvent,
  logNotificationError,
} from "@/utils/notificationHelpers";

interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  categories: number[];
  date: string;
  modified: string;
  featured_media?: number;
}

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

interface WordPressAuthor {
  id: number;
  name: string;
  slug: string;
}

export class WordPressNotificationsService {
  private static instance: WordPressNotificationsService;
  private lastCheckedTimestamp: string | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): WordPressNotificationsService {
    if (!WordPressNotificationsService.instance) {
      WordPressNotificationsService.instance =
        new WordPressNotificationsService();
    }
    return WordPressNotificationsService.instance;
  }

  /**
   * Initialize WordPress notification monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Start periodic checking for new articles
      this.startPeriodicCheck();

      logNotificationEvent("WordPress notifications initialized");
    } catch (error) {
      logNotificationError(
        error,
        "Failed to initialize WordPress notifications"
      );
    }
  }

  /**
   * Stop WordPress notification monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    logNotificationEvent("WordPress notifications stopped");
  }

  /**
   * Start periodic checking for new articles
   */
  private startPeriodicCheck(): void {
    // Check every 5 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkForNewArticles();
    }, 5 * 60 * 1000) as unknown as NodeJS.Timeout;

    // Also check immediately on start
    this.checkForNewArticles().catch(console.error);
  }

  /**
   * Check for new articles and send notifications
   */
  async checkForNewArticles(): Promise<void> {
    try {
      const preferences = await notificationPreferencesService.getPreferences();
      if (!preferences.enabled || !preferences.newArticles) {
        return;
      }

      // Get selected categories
      const selectedCategories =
        await notificationPreferencesService.getSelectedCategories();
      if (selectedCategories.length === 0) {
        return;
      }

      // Build query parameters
      const params: any = {
        per_page: 10,
        orderby: "date",
        order: "desc",
      };

      // Add after parameter if we have a last checked timestamp
      if (this.lastCheckedTimestamp) {
        params.after = this.lastCheckedTimestamp;
      }

      // Add categories filter
      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(",");
      }

      // Fetch recent articles
      const response = await wordpressApiService.get("/posts", params);
      const posts: WordPressPost[] = response.data;

      if (posts.length > 0) {
        // Update last checked timestamp
        this.lastCheckedTimestamp = new Date().toISOString();

        // Send notifications for new articles
        for (const post of posts) {
          await this.sendNewArticleNotification(post, preferences);
        }
      }
    } catch (error) {
      logNotificationError(error, "Failed to check for new articles");
    }
  }

  /**
   * Send notification for new article
   */
  private async sendNewArticleNotification(
    post: WordPressPost,
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      // Get category and author details
      const [categories, author] = await Promise.all([
        this.getPostCategories(post.categories),
        this.getPostAuthor(post.author),
      ]);

      const categoryName =
        categories.length > 0 ? categories[0].name : "General";
      const authorName = author ? author.name : "Unknown Author";

      // Use template for notification
      const template = NOTIFICATION_TEMPLATES.NEW_ARTICLE;
      const title = template.title
        .replace("{title}", this.stripHtml(post.title.rendered))
        .substring(0, 100); // Ensure title length limit

      const body = template.body
        .replace("{author}", authorName)
        .replace("{category}", categoryName)
        .substring(0, 255); // Ensure body length limit

      const data: NotificationData = {
        type: "new_article",
        postId: post.id.toString(),
        categoryId:
          categories.length > 0 ? categories[0].id.toString() : undefined,
        authorId: post.author.toString(),
        priority: "normal",
      };

      // Send local notification
      await notificationService.sendNewArticleNotification(
        title,
        body,
        data.postId,
        data.categoryId,
        data.authorId
      );

      logNotificationEvent("New article notification sent", {
        postId: post.id,
        title: title.substring(0, 50),
      });
    } catch (error) {
      logNotificationError(error, "Failed to send new article notification");
    }
  }

  /**
   * Send breaking news notification
   */
  async sendBreakingNews(
    postId: number,
    title: string,
    summary: string,
    imageUrl?: string
  ): Promise<void> {
    try {
      const preferences = await notificationPreferencesService.getPreferences();
      if (!preferences.enabled || !preferences.breakingNews) {
        return;
      }

      // Use template for breaking news
      const template = NOTIFICATION_TEMPLATES.BREAKING_NEWS;
      const notificationTitle = template.title
        .replace("{title}", title)
        .substring(0, 100);

      const notificationBody = template.body
        .replace("{summary}", summary)
        .substring(0, 255);

      // Send breaking news notification
      await notificationService.sendBreakingNewsNotification(
        notificationTitle,
        notificationBody,
        postId.toString(),
        imageUrl
      );

      // Also send via push service for remote delivery
      await pushNotificationService.sendBreakingNewsPush(
        notificationTitle,
        notificationBody,
        postId.toString(),
        imageUrl
      );

      logNotificationEvent("Breaking news notification sent", {
        postId,
        title: title.substring(0, 50),
      });
    } catch (error) {
      logNotificationError(error, "Failed to send breaking news notification");
    }
  }

  /**
   * Send trending articles notification
   */
  async sendTrendingArticles(
    articles: Array<{
      id: number;
      title: string;
      reads: number;
      category: string;
    }>
  ): Promise<void> {
    try {
      const preferences = await notificationPreferencesService.getPreferences();
      if (!preferences.enabled || !preferences.newArticles) {
        return;
      }

      // Send notification for top trending article
      const topArticle = articles[0];
      if (!topArticle) return;

      const template = NOTIFICATION_TEMPLATES.TRENDING;
      const title = template.title
        .replace("{title}", topArticle.title)
        .substring(0, 100);

      const body = template.body
        .replace("{reads}", topArticle.reads.toString())
        .replace("{category}", topArticle.category)
        .substring(0, 255);

      const data: NotificationData = {
        type: "new_article",
        postId: topArticle.id.toString(),
        priority: "high",
        customData: { trending: true, reads: topArticle.reads },
      };

      await notificationService.sendNewArticleNotification(
        title,
        body,
        data.postId,
        undefined,
        undefined
      );

      logNotificationEvent("Trending article notification sent", {
        postId: topArticle.id,
        reads: topArticle.reads,
      });
    } catch (error) {
      logNotificationError(
        error,
        "Failed to send trending articles notification"
      );
    }
  }

  /**
   * Send author-specific article notification
   */
  async sendAuthorArticleNotification(
    authorId: number,
    post: WordPressPost
  ): Promise<void> {
    try {
      const preferences = await notificationPreferencesService.getPreferences();
      if (!preferences.enabled || !preferences.newArticles) {
        return;
      }

      // Check if user follows this author (this would need to be implemented)
      const followedAuthors = await this.getFollowedAuthors();
      if (!followedAuthors.includes(authorId.toString())) {
        return;
      }

      const author = await this.getPostAuthor(authorId);
      const authorName = author ? author.name : "Unknown Author";

      const title = `New article by ${authorName}`;
      const body = this.stripHtml(post.title.rendered).substring(0, 255);

      const data: NotificationData = {
        type: "new_article",
        postId: post.id.toString(),
        authorId: authorId.toString(),
        priority: "normal",
        customData: { authorSpecific: true },
      };

      await notificationService.sendNewArticleNotification(
        title,
        body,
        data.postId,
        undefined,
        data.authorId
      );

      logNotificationEvent("Author-specific notification sent", {
        authorId,
        postId: post.id,
      });
    } catch (error) {
      logNotificationError(
        error,
        "Failed to send author-specific notification"
      );
    }
  }

  /**
   * Send daily digest notification
   */
  async sendDailyDigest(): Promise<void> {
    try {
      const preferences = await notificationPreferencesService.getPreferences();
      if (!preferences.enabled || !preferences.newArticles) {
        return;
      }

      // Get articles from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await wordpressApiService.get("/posts", {
        per_page: 50,
        after: yesterday.toISOString(),
        orderby: "date",
        order: "desc",
      });

      const posts: WordPressPost[] = response.data;
      if (posts.length === 0) return;

      // Get selected categories
      const selectedCategories =
        await notificationPreferencesService.getSelectedCategories();

      // Filter posts by selected categories
      const filteredPosts =
        selectedCategories.length > 0
          ? posts.filter((post) =>
              post.categories.some((catId) =>
                selectedCategories.includes(catId.toString())
              )
            )
          : posts;

      if (filteredPosts.length === 0) return;

      // Send digest notification
      await notificationService.sendDailyDigestNotification(
        filteredPosts.length
      );

      logNotificationEvent("Daily digest sent", {
        articleCount: filteredPosts.length,
      });
    } catch (error) {
      logNotificationError(error, "Failed to send daily digest");
    }
  }

  /**
   * Get post categories
   */
  private async getPostCategories(
    categoryIds: number[]
  ): Promise<WordPressCategory[]> {
    try {
      if (categoryIds.length === 0) return [];

      const response = await wordpressApiService.get("/categories", {
        include: categoryIds.join(","),
      });

      return response.data;
    } catch (error) {
      logNotificationError(error, "Failed to get post categories");
      return [];
    }
  }

  /**
   * Get post author
   */
  private async getPostAuthor(
    authorId: number
  ): Promise<WordPressAuthor | null> {
    try {
      const response = await wordpressApiService.get(`/users/${authorId}`);
      return response.data;
    } catch (error) {
      logNotificationError(error, "Failed to get post author");
      return null;
    }
  }

  /**
   * Get followed authors (this would need to be implemented based on user preferences)
   */
  private async getFollowedAuthors(): Promise<string[]> {
    try {
      // This would be stored in user preferences
      const preferences = await notificationPreferencesService.getPreferences();
      return []; // TODO: Implement followed authors in preferences
    } catch (error) {
      logNotificationError(error, "Failed to get followed authors");
      return [];
    }
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").trim();
  }

  /**
   * Set up webhook for new content notifications
   */
  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await wordpressApiService.post("/webhooks", {
        url: webhookUrl,
        events: ["post.created", "post.updated"],
        status: "active",
      });

      if (response.status === 201) {
        logNotificationEvent("Webhook setup successful", { url: webhookUrl });
        return true;
      }

      return false;
    } catch (error) {
      logNotificationError(error, "Failed to setup webhook");
      return false;
    }
  }

  /**
   * Handle webhook payload
   */
  async handleWebhookPayload(payload: any): Promise<void> {
    try {
      if (payload.event === "post.created" && payload.post) {
        const post: WordPressPost = payload.post;

        // Check if this matches user preferences
        const preferences =
          await notificationPreferencesService.getPreferences();
        if (!preferences.enabled || !preferences.newArticles) {
          return;
        }

        // Send notification for new post
        await this.sendNewArticleNotification(post, preferences);
      }
    } catch (error) {
      logNotificationError(error, "Failed to handle webhook payload");
    }
  }

  /**
   * Create notification triggers for content updates
   */
  async createContentUpdateTriggers(): Promise<void> {
    try {
      // Set up scheduled digest notification (daily at 8 AM)
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(8, 0, 0, 0);

      // If it's already past 8 AM, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await notificationService.scheduleNotification(
        "Daily News Digest",
        "Check out today's top stories",
        {
          type: "daily" as any,
          hour: scheduledTime.getHours(),
          minute: scheduledTime.getMinutes(),
          repeats: true,
        },
        {
          type: "custom",
          priority: "normal",
          customData: { digest: true },
        }
      );

      logNotificationEvent("Content update triggers created");
    } catch (error) {
      logNotificationError(error, "Failed to create content update triggers");
    }
  }

  /**
   * Implement category-based notification rules
   */
  async applyCategoryRules(postId: number): Promise<boolean> {
    try {
      const preferences = await notificationPreferencesService.getPreferences();
      const selectedCategories = preferences.categories;

      if (selectedCategories.length === 0) {
        return true; // No category filters, allow all
      }

      // Get post categories
      const response = await wordpressApiService.get(`/posts/${postId}`);
      const post: WordPressPost = response.data;

      // Check if post has any selected category
      const hasSelectedCategory = post.categories.some((catId) =>
        selectedCategories.includes(catId.toString())
      );

      logNotificationEvent("Category rule applied", {
        postId,
        hasSelectedCategory,
      });

      return hasSelectedCategory;
    } catch (error) {
      logNotificationError(error, "Failed to apply category rules");
      return false;
    }
  }
}

// Export singleton instance
export const wordpressNotificationsService =
  WordPressNotificationsService.getInstance();
