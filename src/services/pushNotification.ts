import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  PushTokenResponse,
  NotificationRegistrationRequest,
  NotificationCampaignRequest,
} from "@/types/notifications";
import {
  NOTIFICATION_KEYS,
  NOTIFICATION_API_ENDPOINTS,
  NOTIFICATION_ERRORS,
  NOTIFICATION_SUCCESS_MESSAGES,
} from "@/constants/notifications";
import {
  storage,
  getDeviceInfo,
  logNotificationEvent,
  logNotificationError,
} from "@/utils/notificationHelpers";

export class PushNotificationService {
  private static instance: PushNotificationService;
  private backendUrl: string;
  private projectId: string;

  private constructor() {
    this.backendUrl = process.env.EXPO_PUBLIC_API_URL || "https://your-api.com";
    this.projectId = process.env.EXPO_PROJECT_ID || "your-project-id";
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<PushTokenResponse> {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        return {
          success: false,
          message: NOTIFICATION_ERRORS.DEVICE_NOT_SUPPORTED,
        };
      }

      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        return {
          success: false,
          message: NOTIFICATION_ERRORS.PERMISSION_DENIED,
        };
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: this.projectId,
      });

      if (!tokenData.data) {
        return {
          success: false,
          message: NOTIFICATION_ERRORS.TOKEN_GENERATION_FAILED,
        };
      }

      // Store token locally
      await storage.set(NOTIFICATION_KEYS.PUSH_TOKEN, tokenData.data);

      logNotificationEvent("Push token generated", {
        token: tokenData.data.substring(0, 20) + "...",
      });

      return {
        success: true,
        token: tokenData.data,
        message: NOTIFICATION_SUCCESS_MESSAGES.TOKEN_REGISTERED,
      };
    } catch (error) {
      logNotificationError(error, "Failed to register for push notifications");
      return {
        success: false,
        message: NOTIFICATION_ERRORS.TOKEN_GENERATION_FAILED,
      };
    }
  }

  /**
   * Register push token with backend
   */
  async registerTokenWithBackend(token: string): Promise<boolean> {
    try {
      const deviceInfo = getDeviceInfo();
      const registrationData: NotificationRegistrationRequest = {
        token,
        platform: deviceInfo.platform,
        deviceInfo: {
          model: deviceInfo.modelName,
          osVersion: deviceInfo.osVersion,
          appVersion: "1.0.0", // Get from app config
        },
      };

      const response = await fetch(
        `${this.backendUrl}${NOTIFICATION_API_ENDPOINTS.REGISTER_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Mark token as registered
      await storage.set(NOTIFICATION_KEYS.TOKEN_REGISTERED, true);

      logNotificationEvent("Push token registered with backend", {
        platform: deviceInfo.platform,
        model: deviceInfo.modelName,
      });

      return true;
    } catch (error) {
      logNotificationError(error, "Failed to register token with backend");
      return false;
    }
  }

  /**
   * Unregister push token from backend
   */
  async unregisterTokenFromBackend(): Promise<boolean> {
    try {
      const token = await storage.get<string>(NOTIFICATION_KEYS.PUSH_TOKEN);
      if (!token) return true;

      const response = await fetch(
        `${this.backendUrl}${NOTIFICATION_API_ENDPOINTS.REGISTER_TOKEN}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Clear local registration status
      await storage.remove(NOTIFICATION_KEYS.TOKEN_REGISTERED);
      await storage.remove(NOTIFICATION_KEYS.PUSH_TOKEN);

      logNotificationEvent("Push token unregistered from backend");

      return true;
    } catch (error) {
      logNotificationError(error, "Failed to unregister token from backend");
      return false;
    }
  }

  /**
   * Send push notification campaign
   */
  async sendCampaign(campaign: NotificationCampaignRequest): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.backendUrl}${NOTIFICATION_API_ENDPOINTS.CAMPAIGNS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(campaign),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logNotificationEvent("Campaign sent", {
        title: campaign.title,
        targetAudience: campaign.targetAudience,
      });

      return true;
    } catch (error) {
      logNotificationError(error, "Failed to send campaign");
      return false;
    }
  }

  /**
   * Get stored push token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await storage.get<string>(NOTIFICATION_KEYS.PUSH_TOKEN);
    } catch (error) {
      logNotificationError(error, "Failed to get stored token");
      return null;
    }
  }

  /**
   * Check if token is registered with backend
   */
  async isTokenRegistered(): Promise<boolean> {
    try {
      return (
        (await storage.get<boolean>(NOTIFICATION_KEYS.TOKEN_REGISTERED)) ||
        false
      );
    } catch (error) {
      logNotificationError(error, "Failed to check token registration status");
      return false;
    }
  }

  /**
   * Sync token with backend (register if not already registered)
   */
  async syncTokenWithBackend(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        // Generate new token
        const tokenResponse = await this.registerForPushNotifications();
        if (!tokenResponse.success || !tokenResponse.token) {
          return false;
        }
        return await this.registerTokenWithBackend(tokenResponse.token);
      }

      const isRegistered = await this.isTokenRegistered();
      if (!isRegistered) {
        return await this.registerTokenWithBackend(token);
      }

      return true;
    } catch (error) {
      logNotificationError(error, "Failed to sync token with backend");
      return false;
    }
  }

  /**
   * Schedule a push notification via backend
   */
  async schedulePushNotification(
    title: string,
    body: string,
    data: any,
    scheduledFor?: Date,
    targetAudience?: NotificationCampaignRequest["targetAudience"]
  ): Promise<boolean> {
    try {
      const campaign: NotificationCampaignRequest = {
        title,
        body,
        data,
        targetAudience: targetAudience || { all: true },
        scheduledFor,
        priority: "normal",
      };

      return await this.sendCampaign(campaign);
    } catch (error) {
      logNotificationError(error, "Failed to schedule push notification");
      return false;
    }
  }

  /**
   * Send breaking news push notification
   */
  async sendBreakingNewsPush(
    title: string,
    body: string,
    postId?: string,
    imageUrl?: string
  ): Promise<boolean> {
    try {
      const campaign: NotificationCampaignRequest = {
        title,
        body,
        data: {
          type: "breaking_news",
          postId,
          imageUrl,
          priority: "urgent",
        },
        targetAudience: { all: true },
        priority: "urgent",
      };

      return await this.sendCampaign(campaign);
    } catch (error) {
      logNotificationError(error, "Failed to send breaking news push");
      return false;
    }
  }

  /**
   * Send targeted push notification to specific users
   */
  async sendTargetedPush(
    title: string,
    body: string,
    data: any,
    userIds: string[]
  ): Promise<boolean> {
    try {
      const campaign: NotificationCampaignRequest = {
        title,
        body,
        data,
        targetAudience: { users: userIds },
        priority: "normal",
      };

      return await this.sendCampaign(campaign);
    } catch (error) {
      logNotificationError(error, "Failed to send targeted push");
      return false;
    }
  }

  /**
   * Send category-based push notification
   */
  async sendCategoryPush(
    title: string,
    body: string,
    data: any,
    categoryIds: string[]
  ): Promise<boolean> {
    try {
      const campaign: NotificationCampaignRequest = {
        title,
        body,
        data,
        targetAudience: { categories: categoryIds },
        priority: "normal",
      };

      return await this.sendCampaign(campaign);
    } catch (error) {
      logNotificationError(error, "Failed to send category push");
      return false;
    }
  }

  /**
   * Get authentication token for API requests
   */
  private async getAuthToken(): Promise<string> {
    try {
      // Get user auth token from storage
      const authData = await storage.get<any>("auth_data");
      return authData?.token || "";
    } catch (error) {
      logNotificationError(error, "Failed to get auth token");
      return "";
    }
  }

  /**
   * Handle incoming push notification
   */
  async handlePushNotification(
    notification: Notifications.Notification
  ): Promise<void> {
    try {
      const data = notification.request.content.data;

      // Add to notification history
      const { addToNotificationHistory } = await import(
        "@/utils/notificationHelpers"
      );
      await addToNotificationHistory(notification);

      // Handle different notification types
      switch (data.type) {
        case "breaking_news":
          await this.handleBreakingNewsNotification(data);
          break;
        case "new_article":
          await this.handleNewArticleNotification(data);
          break;
        case "recommended":
          await this.handleRecommendedNotification(data);
          break;
        default:
          await this.handleGenericNotification(data);
      }

      logNotificationEvent("Push notification handled", { type: data.type });
    } catch (error) {
      logNotificationError(error, "Failed to handle push notification");
    }
  }

  /**
   * Handle breaking news notification
   */
  private async handleBreakingNewsNotification(data: any): Promise<void> {
    // Update badge count
    await this.updateBadgeCount(1);

    // Trigger any breaking news specific logic
    // e.g., update app state, refresh content, etc.
  }

  /**
   * Handle new article notification
   */
  private async handleNewArticleNotification(data: any): Promise<void> {
    // Update badge count
    await this.updateBadgeCount(1);

    // Update article cache or trigger refresh
    if (data.postId) {
      // Mark article as new/unread
      await this.markArticleAsUnread(data.postId);
    }
  }

  /**
   * Handle recommended content notification
   */
  private async handleRecommendedNotification(data: any): Promise<void> {
    // Update badge count
    await this.updateBadgeCount(1);

    // Update recommendation cache
    if (data.postId) {
      // Add to recommended articles
      await this.addToRecommendations(data.postId);
    }
  }

  /**
   * Handle generic notification
   */
  private async handleGenericNotification(data: any): Promise<void> {
    // Update badge count
    await this.updateBadgeCount(1);
  }

  /**
   * Update app badge count
   */
  private async updateBadgeCount(increment: number): Promise<void> {
    try {
      const currentCount = await Notifications.getBadgeCountAsync();
      await Notifications.setBadgeCountAsync(currentCount + increment);
    } catch (error) {
      logNotificationError(error, "Failed to update badge count");
    }
  }

  /**
   * Mark article as unread
   */
  private async markArticleAsUnread(postId: string): Promise<void> {
    try {
      // Implementation depends on your article storage system
      await storage.set(`unread_article_${postId}`, true);
    } catch (error) {
      logNotificationError(error, "Failed to mark article as unread");
    }
  }

  /**
   * Add article to recommendations
   */
  private async addToRecommendations(postId: string): Promise<void> {
    try {
      const recommendations =
        (await storage.get<string[]>("recommended_articles")) || [];
      if (!recommendations.includes(postId)) {
        recommendations.unshift(postId);
        await storage.set("recommended_articles", recommendations.slice(0, 50)); // Keep last 50
      }
    } catch (error) {
      logNotificationError(error, "Failed to add to recommendations");
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.setBadgeCountAsync(0);

      logNotificationEvent("All notifications cleared");
    } catch (error) {
      logNotificationError(error, "Failed to clear all notifications");
    }
  }

  /**
   * Get notification delivery status from backend
   */
  async getDeliveryStatus(notificationId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/v1/notifications/${notificationId}/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logNotificationError(error, "Failed to get delivery status");
      return null;
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
