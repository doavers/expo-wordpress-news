import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  NotificationData,
  NotificationHistory,
  ScheduledNotification,
  NotificationPreferences,
  NotificationValidationResult,
} from "@/types/notifications";
import {
  NOTIFICATION_KEYS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TEMPLATES,
  NOTIFICATION_LIMITS,
  NOTIFICATION_ERRORS,
  NOTIFICATION_SUCCESS_MESSAGES,
} from "@/constants/notifications";
import {
  validateNotificationContent,
  addToNotificationHistory,
  isWithinQuietHours,
  formatNotificationTitle,
  formatNotificationBody,
  storage,
  logNotificationEvent,
  logNotificationError,
} from "@/utils/notificationHelpers";

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification channels for Android
   */
  async initializeChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    try {
      for (const channel of NOTIFICATION_CHANNELS) {
        await Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          description: channel.description,
          importance: channel.importance,
          sound: channel.sound,
          vibrationPattern: channel.vibrationPattern,
          enableLights: channel.enableLights,
          lightColor: channel.lightColor,
          enableVibrate: channel.enableVibrate,
          bypassDnd: channel.bypassDnd,
        });

        logNotificationEvent(`Channel initialized: ${channel.name}`);
      }
    } catch (error) {
      logNotificationError(error, "Failed to initialize notification channels");
      throw new Error(NOTIFICATION_ERRORS.CHANNEL_CREATION_FAILED);
    }
  }

  /**
   * Send a local notification immediately
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data: NotificationData,
    channelId?: string,
    priority?: Notifications.AndroidNotificationPriority
  ): Promise<string> {
    try {
      // Validate notification content
      const validation = validateNotificationContent(title, body, data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Check quiet hours
      const preferences = await this.getPreferences();
      if (preferences.enabled && preferences.quietHours.enabled) {
        const now = new Date();
        if (
          isWithinQuietHours(
            now,
            preferences.quietHours.start,
            preferences.quietHours.end
          )
        ) {
          logNotificationEvent("Notification suppressed due to quiet hours");
          return "";
        }
      }

      // Format content
      const formattedTitle = formatNotificationTitle(title);
      const formattedBody = formatNotificationBody(body);

      // Create notification content
      const notificationContent: Notifications.NotificationContentInput = {
        title: formattedTitle,
        body: formattedBody,
        data: data as any,
        sound: preferences.soundEnabled ? "default" : undefined,
        badge: preferences.badgeEnabled ? 1 : undefined,
        categoryId: data.type === "breaking_news" ? "breaking-news" : "default",
      };

      // Add channel ID for Android
      if (Platform.OS === "android") {
        notificationContent.channelId =
          channelId || this.getDefaultChannelId(data.type);
        if (priority) {
          notificationContent.priority = priority;
        }
      }

      // Schedule notification immediately
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Show immediately
      });

      // Add to history
      await addToNotificationHistory({
        request: {
          identifier: notificationId,
          content: notificationContent,
          trigger: null,
        },
      } as Notifications.Notification);

      logNotificationEvent("Local notification sent", {
        notificationId,
        title: formattedTitle,
        type: data.type,
      });

      return notificationId;
    } catch (error) {
      logNotificationError(error, "Failed to send local notification");
      throw new Error(NOTIFICATION_ERRORS.INVALID_DATA);
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data: NotificationData,
    channelId?: string
  ): Promise<string | null> {
    try {
      // Validate notification content
      const validation = validateNotificationContent(title, body, data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Format content
      const formattedTitle = formatNotificationTitle(title);
      const formattedBody = formatNotificationBody(body);

      // Create notification content
      const notificationContent: Notifications.NotificationContentInput = {
        title: formattedTitle,
        body: formattedBody,
        data: data as any,
        sound: "default",
      };

      // Add channel ID for Android
      if (Platform.OS === "android") {
        (notificationContent as any).channelId =
          channelId || this.getDefaultChannelId(data.type);
      }

      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger,
      });

      // Add to scheduled notifications
      const scheduledNotification: ScheduledNotification = {
        id: notificationId,
        title: formattedTitle,
        body: formattedBody,
        trigger,
        data,
        scheduledAt: new Date(),
        repeats: trigger && "repeats" in trigger ? trigger.repeats : false,
      };

      await this.addScheduledNotification(scheduledNotification);

      logNotificationEvent("Notification scheduled", {
        notificationId,
        title: formattedTitle,
        scheduledFor: trigger,
      });

      return notificationId;
    } catch (error) {
      logNotificationError(error, "Failed to schedule notification");
      throw new Error(NOTIFICATION_ERRORS.SCHEDULING_FAILED);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeScheduledNotification(notificationId);

      logNotificationEvent("Scheduled notification cancelled", {
        notificationId,
      });
    } catch (error) {
      logNotificationError(error, "Failed to cancel scheduled notification");
      throw error;
    }
  }

  /**
   * Send breaking news notification with high priority
   */
  async sendBreakingNewsNotification(
    title: string,
    body: string,
    postId?: string,
    imageUrl?: string
  ): Promise<string> {
    const data: NotificationData = {
      type: "breaking_news",
      postId,
      priority: "urgent",
      imageUrl,
    };

    return this.sendLocalNotification(
      title,
      body,
      data,
      "breaking-news",
      Platform.OS === "android"
        ? Notifications.AndroidNotificationPriority.HIGH
        : undefined
    );
  }

  /**
   * Send new article notification
   */
  async sendNewArticleNotification(
    title: string,
    body: string,
    postId: string,
    categoryId?: string,
    authorId?: string
  ): Promise<string> {
    const data: NotificationData = {
      type: "new_article",
      postId,
      categoryId,
      authorId,
      priority: "normal",
    };

    return this.sendLocalNotification(title, body, data, "new-articles");
  }

  /**
   * Send recommended content notification
   */
  async sendRecommendedNotification(
    title: string,
    body: string,
    postId?: string,
    customData?: Record<string, any>
  ): Promise<string> {
    const data: NotificationData = {
      type: "recommended",
      postId,
      priority: "low",
      customData,
    };

    return this.sendLocalNotification(title, body, data, "recommended");
  }

  /**
   * Send daily digest notification
   */
  async sendDailyDigestNotification(articleCount: number): Promise<string> {
    const template = NOTIFICATION_TEMPLATES.DAILY_DIGEST;
    const title = template.title.replace("{count}", articleCount.toString());
    const body = template.body.replace("{count}", articleCount.toString());

    const data: NotificationData = {
      type: "custom",
      priority: "normal",
      customData: { digest: true, articleCount },
    };

    return this.sendLocalNotification(title, body, data);
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const preferences = await storage.get<NotificationPreferences>(
        NOTIFICATION_KEYS.PREFERENCES
      );
      return (
        preferences || {
          enabled: true,
          breakingNews: true,
          newArticles: true,
          recommendedContent: false,
          quietHours: {
            enabled: false,
            start: NOTIFICATION_LIMITS.DEFAULT_QUIET_HOURS_START,
            end: NOTIFICATION_LIMITS.DEFAULT_QUIET_HOURS_END,
          },
          categories: [],
          soundEnabled: true,
          vibrationEnabled: true,
          badgeEnabled: true,
        }
      );
    } catch (error) {
      logNotificationError(error, "Failed to get notification preferences");
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const currentPreferences = await this.getPreferences();
      const newPreferences = { ...currentPreferences, ...updates };

      await storage.set(NOTIFICATION_KEYS.PREFERENCES, newPreferences);

      logNotificationEvent("Notification preferences updated", { updates });
    } catch (error) {
      logNotificationError(error, "Failed to update notification preferences");
      throw error;
    }
  }

  /**
   * Get default channel ID based on notification type
   */
  private getDefaultChannelId(type: string): string {
    switch (type) {
      case "breaking_news":
        return "breaking-news";
      case "new_article":
        return "new-articles";
      case "recommended":
        return "recommended";
      case "system":
        return "system";
      default:
        return "default";
    }
  }

  /**
   * Add scheduled notification to storage
   */
  private async addScheduledNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    try {
      const scheduled =
        (await storage.get<ScheduledNotification[]>(
          NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS
        )) || [];
      const updatedScheduled = [...scheduled, notification];

      // Limit scheduled notifications
      if (
        updatedScheduled.length >
        NOTIFICATION_LIMITS.MAX_SCHEDULED_NOTIFICATIONS
      ) {
        updatedScheduled.splice(
          0,
          updatedScheduled.length -
            NOTIFICATION_LIMITS.MAX_SCHEDULED_NOTIFICATIONS
        );
      }

      await storage.set(
        NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS,
        updatedScheduled
      );
    } catch (error) {
      logNotificationError(error, "Failed to add scheduled notification");
    }
  }

  /**
   * Remove scheduled notification from storage
   */
  private async removeScheduledNotification(
    notificationId: string
  ): Promise<void> {
    try {
      const scheduled =
        (await storage.get<ScheduledNotification[]>(
          NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS
        )) || [];
      const updatedScheduled = scheduled.filter(
        (item) => item.id !== notificationId
      );
      await storage.set(
        NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS,
        updatedScheduled
      );
    } catch (error) {
      logNotificationError(error, "Failed to remove scheduled notification");
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      return (
        (await storage.get<ScheduledNotification[]>(
          NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS
        )) || []
      );
    } catch (error) {
      logNotificationError(error, "Failed to get scheduled notifications");
      return [];
    }
  }

  /**
   * Clear all scheduled notifications
   */
  async clearAllScheduledNotifications(): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();

      // Cancel each scheduled notification
      for (const notification of scheduled) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notification.id);
        } catch (error) {
          logNotificationError(
            error,
            `Failed to cancel notification ${notification.id}`
          );
        }
      }

      // Clear storage
      await storage.remove(NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS);

      logNotificationEvent("All scheduled notifications cleared");
    } catch (error) {
      logNotificationError(error, "Failed to clear scheduled notifications");
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
