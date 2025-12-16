import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NotificationPreferences,
  NotificationSettings,
  NotificationFrequency,
  NotificationCategory,
} from "@/types/notifications";
import {
  NOTIFICATION_KEYS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
} from "@/constants/notifications";
import {
  storage,
  logNotificationEvent,
  logNotificationError,
} from "@/utils/notificationHelpers";

export class NotificationPreferencesService {
  private static instance: NotificationPreferencesService;
  private backendUrl: string;

  private constructor() {
    this.backendUrl = process.env.EXPO_PUBLIC_API_URL || "https://your-api.com";
  }

  static getInstance(): NotificationPreferencesService {
    if (!NotificationPreferencesService.instance) {
      NotificationPreferencesService.instance =
        new NotificationPreferencesService();
    }
    return NotificationPreferencesService.instance;
  }

  /**
   * Get notification preferences from local storage
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const preferences = await storage.get<NotificationPreferences>(
        NOTIFICATION_KEYS.PREFERENCES
      );
      return preferences || DEFAULT_NOTIFICATION_PREFERENCES;
    } catch (error) {
      logNotificationError(error, "Failed to get notification preferences");
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  /**
   * Save notification preferences to local storage
   */
  async savePreferences(
    preferences: NotificationPreferences
  ): Promise<boolean> {
    try {
      await storage.set(NOTIFICATION_KEYS.PREFERENCES, preferences);

      logNotificationEvent("Notification preferences saved locally", {
        enabled: preferences.enabled,
        breakingNews: preferences.breakingNews,
        newArticles: preferences.newArticles,
        recommendedContent: preferences.recommendedContent,
      });

      return true;
    } catch (error) {
      logNotificationError(error, "Failed to save notification preferences");
      return false;
    }
  }

  /**
   * Update specific preference fields
   */
  async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const currentPreferences = await this.getPreferences();
      const newPreferences = { ...currentPreferences, ...updates };

      return await this.savePreferences(newPreferences);
    } catch (error) {
      logNotificationError(error, "Failed to update notification preferences");
      return false;
    }
  }

  /**
   * Reset preferences to default values
   */
  async resetPreferences(): Promise<boolean> {
    try {
      return await this.savePreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } catch (error) {
      logNotificationError(error, "Failed to reset notification preferences");
      return false;
    }
  }

  /**
   * Get comprehensive notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const preferences = await this.getPreferences();

      return {
        global: {
          enabled: preferences.enabled,
          frequency: "realtime" as NotificationFrequency, // Could be stored separately
          soundEnabled: preferences.soundEnabled,
          vibrationEnabled: preferences.vibrationEnabled,
          badgeEnabled: preferences.badgeEnabled,
          previewEnabled: true, // Default value
        },
        categories: {
          breakingNews: preferences.breakingNews,
          newArticles: preferences.newArticles,
          recommendedContent: preferences.recommendedContent,
          systemUpdates: false, // Default value
          customNotifications: false, // Default value
        },
        quietHours: {
          enabled: preferences.quietHours.enabled,
          start: preferences.quietHours.start,
          end: preferences.quietHours.end,
          weekendOnly: false, // Default value
        },
        custom: {}, // For custom notification types
      };
    } catch (error) {
      logNotificationError(error, "Failed to get notification settings");
      throw error;
    }
  }

  /**
   * Update comprehensive notification settings
   */
  async updateSettings(settings: NotificationSettings): Promise<boolean> {
    try {
      const preferences: NotificationPreferences = {
        enabled: settings.global.enabled,
        breakingNews: settings.categories.breakingNews,
        newArticles: settings.categories.newArticles,
        recommendedContent: settings.categories.recommendedContent,
        soundEnabled: settings.global.soundEnabled,
        vibrationEnabled: settings.global.vibrationEnabled,
        badgeEnabled: settings.global.badgeEnabled,
        quietHours: {
          enabled: settings.quietHours.enabled,
          start: settings.quietHours.start,
          end: settings.quietHours.end,
        },
        categories: [], // Could be populated from settings.custom
      };

      return await this.savePreferences(preferences);
    } catch (error) {
      logNotificationError(error, "Failed to update notification settings");
      return false;
    }
  }

  /**
   * Get available notification categories
   */
  async getAvailableCategories(): Promise<NotificationCategory[]> {
    try {
      // Try to get from backend first, fallback to defaults
      try {
        const response = await fetch(
          `${this.backendUrl}/api/v1/notifications/categories`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await this.getAuthToken()}`,
            },
          }
        );

        if (response.ok) {
          const categories = await response.json();
          return categories;
        }
      } catch (error) {
        logNotificationError(
          error,
          "Failed to fetch categories from backend, using defaults"
        );
      }

      // Return default categories
      return DEFAULT_CATEGORIES;
    } catch (error) {
      logNotificationError(error, "Failed to get available categories");
      return DEFAULT_CATEGORIES;
    }
  }

  /**
   * Get user's selected categories
   */
  async getSelectedCategories(): Promise<string[]> {
    try {
      const preferences = await this.getPreferences();
      return preferences.categories || [];
    } catch (error) {
      logNotificationError(error, "Failed to get selected categories");
      return [];
    }
  }

  /**
   * Update user's selected categories
   */
  async updateSelectedCategories(categoryIds: string[]): Promise<boolean> {
    try {
      return await this.updatePreferences({ categories: categoryIds });
    } catch (error) {
      logNotificationError(error, "Failed to update selected categories");
      return false;
    }
  }

  /**
   * Add category to selected categories
   */
  async addCategory(categoryId: string): Promise<boolean> {
    try {
      const categories = await this.getSelectedCategories();
      if (!categories.includes(categoryId)) {
        categories.push(categoryId);
        return await this.updateSelectedCategories(categories);
      }
      return true;
    } catch (error) {
      logNotificationError(error, "Failed to add category");
      return false;
    }
  }

  /**
   * Remove category from selected categories
   */
  async removeCategory(categoryId: string): Promise<boolean> {
    try {
      const categories = await this.getSelectedCategories();
      const updatedCategories = categories.filter((id) => id !== categoryId);
      return await this.updateSelectedCategories(updatedCategories);
    } catch (error) {
      logNotificationError(error, "Failed to remove category");
      return false;
    }
  }

  /**
   * Toggle category selection
   */
  async toggleCategory(categoryId: string): Promise<boolean> {
    try {
      const categories = await this.getSelectedCategories();
      if (categories.includes(categoryId)) {
        return await this.removeCategory(categoryId);
      } else {
        return await this.addCategory(categoryId);
      }
    } catch (error) {
      logNotificationError(error, "Failed to toggle category");
      return false;
    }
  }

  /**
   * Update quiet hours settings
   */
  async updateQuietHours(
    enabled: boolean,
    start: string,
    end: string
  ): Promise<boolean> {
    try {
      return await this.updatePreferences({
        quietHours: { enabled, start, end },
      });
    } catch (error) {
      logNotificationError(error, "Failed to update quiet hours");
      return false;
    }
  }

  /**
   * Enable/disable notifications globally
   */
  async setGlobalEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ enabled });
    } catch (error) {
      logNotificationError(error, "Failed to set global enabled state");
      return false;
    }
  }

  /**
   * Enable/disable breaking news notifications
   */
  async setBreakingNewsEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ breakingNews: enabled });
    } catch (error) {
      logNotificationError(error, "Failed to set breaking news enabled state");
      return false;
    }
  }

  /**
   * Enable/disable new article notifications
   */
  async setNewArticlesEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ newArticles: enabled });
    } catch (error) {
      logNotificationError(error, "Failed to set new articles enabled state");
      return false;
    }
  }

  /**
   * Enable/disable recommended content notifications
   */
  async setRecommendedContentEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ recommendedContent: enabled });
    } catch (error) {
      logNotificationError(
        error,
        "Failed to set recommended content enabled state"
      );
      return false;
    }
  }

  /**
   * Enable/disable notification sound
   */
  async setSoundEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ soundEnabled: enabled });
    } catch (error) {
      logNotificationError(error, "Failed to set sound enabled state");
      return false;
    }
  }

  /**
   * Enable/disable notification vibration
   */
  async setVibrationEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ vibrationEnabled: enabled });
    } catch (error) {
      logNotificationError(error, "Failed to set vibration enabled state");
      return false;
    }
  }

  /**
   * Enable/disable app badge
   */
  async setBadgeEnabled(enabled: boolean): Promise<boolean> {
    try {
      return await this.updatePreferences({ badgeEnabled: enabled });
    } catch (error) {
      logNotificationError(error, "Failed to set badge enabled state");
      return false;
    }
  }

  /**
   * Sync preferences with backend
   */
  async syncWithBackend(): Promise<boolean> {
    try {
      const preferences = await this.getPreferences();

      const response = await fetch(
        `${this.backendUrl}/api/v1/notifications/preferences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logNotificationEvent("Preferences synced with backend");
      return true;
    } catch (error) {
      logNotificationError(error, "Failed to sync preferences with backend");
      return false;
    }
  }

  /**
   * Load preferences from backend
   */
  async loadFromBackend(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/v1/notifications/preferences`,
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

      const backendPreferences = await response.json();

      // Merge with local preferences (backend takes precedence)
      await this.savePreferences(backendPreferences);

      logNotificationEvent("Preferences loaded from backend");
      return true;
    } catch (error) {
      logNotificationError(error, "Failed to load preferences from backend");
      return false;
    }
  }

  /**
   * Get notification frequency settings
   */
  async getFrequencySettings(): Promise<{
    [key: string]: NotificationFrequency;
  }> {
    try {
      const frequencies = await storage.get<{
        [key: string]: NotificationFrequency;
      }>("notification_frequencies");
      return (
        frequencies || {
          breakingNews: "realtime",
          newArticles: "realtime",
          recommendedContent: "daily",
        }
      );
    } catch (error) {
      logNotificationError(error, "Failed to get frequency settings");
      return {};
    }
  }

  /**
   * Update notification frequency for a specific type
   */
  async updateFrequency(
    type: string,
    frequency: NotificationFrequency
  ): Promise<boolean> {
    try {
      const frequencies = await this.getFrequencySettings();
      frequencies[type] = frequency;

      await storage.set("notification_frequencies", frequencies);

      logNotificationEvent("Frequency updated", { type, frequency });
      return true;
    } catch (error) {
      logNotificationError(error, "Failed to update frequency");
      return false;
    }
  }

  /**
   * Export preferences for backup
   */
  async exportPreferences(): Promise<string> {
    try {
      const preferences = await this.getPreferences();
      const settings = await this.getSettings();
      const frequencies = await this.getFrequencySettings();
      const categories = await this.getSelectedCategories();

      const exportData = {
        preferences,
        settings,
        frequencies,
        selectedCategories: categories,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logNotificationError(error, "Failed to export preferences");
      throw error;
    }
  }

  /**
   * Import preferences from backup
   */
  async importPreferences(exportData: string): Promise<boolean> {
    try {
      const data = JSON.parse(exportData);

      if (data.preferences) {
        await this.savePreferences(data.preferences);
      }

      if (data.frequencies) {
        await storage.set("notification_frequencies", data.frequencies);
      }

      if (data.selectedCategories) {
        await this.updateSelectedCategories(data.selectedCategories);
      }

      logNotificationEvent("Preferences imported successfully");
      return true;
    } catch (error) {
      logNotificationError(error, "Failed to import preferences");
      return false;
    }
  }

  /**
   * Get authentication token for API requests
   */
  private async getAuthToken(): Promise<string> {
    try {
      const authData = await storage.get<any>("auth_data");
      return authData?.token || "";
    } catch (error) {
      logNotificationError(error, "Failed to get auth token");
      return "";
    }
  }

  /**
   * Validate preferences data
   */
  validatePreferences(preferences: any): boolean {
    try {
      // Check required fields
      if (typeof preferences.enabled !== "boolean") return false;
      if (typeof preferences.breakingNews !== "boolean") return false;
      if (typeof preferences.newArticles !== "boolean") return false;
      if (typeof preferences.recommendedContent !== "boolean") return false;

      // Check quiet hours
      if (!preferences.quietHours) return false;
      if (typeof preferences.quietHours.enabled !== "boolean") return false;
      if (typeof preferences.quietHours.start !== "string") return false;
      if (typeof preferences.quietHours.end !== "string") return false;

      // Check other settings
      if (typeof preferences.soundEnabled !== "boolean") return false;
      if (typeof preferences.vibrationEnabled !== "boolean") return false;
      if (typeof preferences.badgeEnabled !== "boolean") return false;

      // Check categories
      if (!Array.isArray(preferences.categories)) return false;

      return true;
    } catch (error) {
      logNotificationError(error, "Preferences validation failed");
      return false;
    }
  }

  /**
   * Get preference summary for analytics
   */
  async getPreferenceSummary(): Promise<any> {
    try {
      const preferences = await this.getPreferences();
      const categories = await this.getSelectedCategories();

      return {
        globalEnabled: preferences.enabled,
        breakingNewsEnabled: preferences.breakingNews,
        newArticlesEnabled: preferences.newArticles,
        recommendedContentEnabled: preferences.recommendedContent,
        quietHoursEnabled: preferences.quietHours.enabled,
        soundEnabled: preferences.soundEnabled,
        vibrationEnabled: preferences.vibrationEnabled,
        badgeEnabled: preferences.badgeEnabled,
        selectedCategoryCount: categories.length,
        selectedCategories: categories,
      };
    } catch (error) {
      logNotificationError(error, "Failed to get preference summary");
      return null;
    }
  }
}

// Export singleton instance
export const notificationPreferencesService =
  NotificationPreferencesService.getInstance();
