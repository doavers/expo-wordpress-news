import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  NOTIFICATION_KEYS,
  NOTIFICATION_LIMITS,
  NOTIFICATION_ERRORS,
} from "@/constants/notifications";
import {
  NotificationData,
  NotificationHistory,
  ScheduledNotification,
  NotificationValidationResult,
} from "@/types/notifications";

// Time and scheduling helpers
export const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const isWithinQuietHours = (
  currentTime: Date,
  quietHoursStart: string,
  quietHoursEnd: string
): boolean => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = parseTimeToMinutes(quietHoursStart);
  const endMinutes = parseTimeToMinutes(quietHoursEnd);

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const createDailyTrigger = (
  hour: number,
  minute: number = 0
): Notifications.DailyTriggerInput => ({
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour,
  minute,
});

export const createWeeklyTrigger = (
  weekday: number,
  hour: number,
  minute: number = 0
): Notifications.WeeklyTriggerInput => ({
  type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
  weekday,
  hour,
  minute,
});

export const createIntervalTrigger = (
  seconds: number
): Notifications.TimeIntervalTriggerInput => ({
  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds,
  repeats: true,
});

// Notification content helpers
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

export const formatNotificationTitle = (title: string): string => {
  return truncateText(title, NOTIFICATION_LIMITS.MAX_TITLE_LENGTH);
};

export const formatNotificationBody = (body: string): string => {
  return truncateText(body, NOTIFICATION_LIMITS.MAX_BODY_LENGTH);
};

// Storage helpers
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  },

  async clear(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error(`Error clearing items ${keys.join(", ")}:`, error);
      return false;
    }
  },
};

// Validation helpers
export const validateNotificationContent = (
  title: string,
  body: string,
  data: NotificationData
): NotificationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("Notification title is required");
  }

  if (!body || body.trim().length === 0) {
    errors.push("Notification body is required");
  }

  if (title.length > NOTIFICATION_LIMITS.MAX_TITLE_LENGTH) {
    errors.push(
      `Title exceeds maximum length of ${NOTIFICATION_LIMITS.MAX_TITLE_LENGTH} characters`
    );
  }

  if (body.length > NOTIFICATION_LIMITS.MAX_BODY_LENGTH) {
    errors.push(
      `Body exceeds maximum length of ${NOTIFICATION_LIMITS.MAX_BODY_LENGTH} characters`
    );
  }

  if (
    data.customData &&
    JSON.stringify(data.customData).length >
      NOTIFICATION_LIMITS.MAX_CUSTOM_DATA_SIZE
  ) {
    errors.push(
      `Custom data exceeds maximum size of ${NOTIFICATION_LIMITS.MAX_CUSTOM_DATA_SIZE} bytes`
    );
  }

  // Add warnings for best practices
  if (title.length > 50) {
    warnings.push("Long titles may be truncated on some devices");
  }

  if (body.length > 150) {
    warnings.push("Long bodies may be truncated on some devices");
  }

  if (!data.type) {
    errors.push("Notification type is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Notification history helpers
export const addToNotificationHistory = async (
  notification: Notifications.Notification
): Promise<boolean> => {
  try {
    const history =
      (await storage.get<NotificationHistory[]>(
        NOTIFICATION_KEYS.NOTIFICATION_HISTORY
      )) || [];

    // Safely convert notification data to NotificationData with fallback
    const rawData = notification.request.content.data as Record<
      string,
      unknown
    >;
    const safeData: NotificationData = {
      type: (rawData.type as NotificationData["type"]) || "custom",
      postId: rawData.postId as string,
      categoryId: rawData.categoryId as string,
      authorId: rawData.authorId as string,
      priority: rawData.priority as NotificationData["priority"],
      imageUrl: rawData.imageUrl as string,
      url: rawData.url as string,
      customData: rawData.customData as Record<string, any>,
    };

    const historyItem: NotificationHistory = {
      id: notification.request.identifier,
      title: notification.request.content.title || "",
      body: notification.request.content.body || "",
      data: safeData,
      receivedAt: new Date(),
      read: false,
      interacted: false,
    };

    // Add new item to the beginning
    const updatedHistory = [historyItem, ...history];

    // Limit history size
    if (updatedHistory.length > NOTIFICATION_LIMITS.MAX_NOTIFICATION_HISTORY) {
      updatedHistory.splice(NOTIFICATION_LIMITS.MAX_NOTIFICATION_HISTORY);
    }

    return await storage.set(
      NOTIFICATION_KEYS.NOTIFICATION_HISTORY,
      updatedHistory
    );
  } catch (error) {
    console.error("Error adding to notification history:", error);
    return false;
  }
};

export const getNotificationHistory = async (): Promise<
  NotificationHistory[]
> => {
  try {
    return (
      (await storage.get<NotificationHistory[]>(
        NOTIFICATION_KEYS.NOTIFICATION_HISTORY
      )) || []
    );
  } catch (error) {
    console.error("Error getting notification history:", error);
    return [];
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.map((item) =>
      item.id === notificationId ? { ...item, read: true } : item
    );
    return await storage.set(
      NOTIFICATION_KEYS.NOTIFICATION_HISTORY,
      updatedHistory
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

export const markNotificationAsInteracted = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.map((item) =>
      item.id === notificationId
        ? { ...item, read: true, interacted: true }
        : item
    );
    return await storage.set(
      NOTIFICATION_KEYS.NOTIFICATION_HISTORY,
      updatedHistory
    );
  } catch (error) {
    console.error("Error marking notification as interacted:", error);
    return false;
  }
};

export const clearNotificationHistory = async (): Promise<boolean> => {
  try {
    return await storage.remove(NOTIFICATION_KEYS.NOTIFICATION_HISTORY);
  } catch (error) {
    console.error("Error clearing notification history:", error);
    return false;
  }
};

// Scheduled notifications helpers
export const addScheduledNotification = async (
  scheduledNotification: ScheduledNotification
): Promise<boolean> => {
  try {
    const scheduled =
      (await storage.get<ScheduledNotification[]>(
        NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS
      )) || [];
    const updatedScheduled = [...scheduled, scheduledNotification];
    return await storage.set(
      NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS,
      updatedScheduled
    );
  } catch (error) {
    console.error("Error adding scheduled notification:", error);
    return false;
  }
};

export const removeScheduledNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const scheduled =
      (await storage.get<ScheduledNotification[]>(
        NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS
      )) || [];
    const updatedScheduled = scheduled.filter(
      (item) => item.id !== notificationId
    );
    return await storage.set(
      NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS,
      updatedScheduled
    );
  } catch (error) {
    console.error("Error removing scheduled notification:", error);
    return false;
  }
};

export const getScheduledNotifications = async (): Promise<
  ScheduledNotification[]
> => {
  try {
    return (
      (await storage.get<ScheduledNotification[]>(
        NOTIFICATION_KEYS.SCHEDULED_NOTIFICATIONS
      )) || []
    );
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};

// Device helpers
export const getDeviceInfo = () => {
  return {
    platform: Device.osName === "iOS" ? "ios" : "android",
    modelName: Device.modelName || "Unknown",
    osVersion: Device.osVersion || "Unknown",
    isDevice: Device.isDevice,
  };
};

// Permission helpers
export const shouldRequestPermissions = async (): Promise<boolean> => {
  const lastRequest = await storage.get<number>(
    NOTIFICATION_KEYS.LAST_PERMISSION_REQUEST
  );
  if (!lastRequest) return true;

  const cooldownPeriod = NOTIFICATION_LIMITS.MIN_PERMISSION_REQUEST_COOLDOWN;
  return Date.now() - lastRequest > cooldownPeriod;
};

export const setPermissionRequestTimestamp = async (): Promise<boolean> => {
  return await storage.set(
    NOTIFICATION_KEYS.LAST_PERMISSION_REQUEST,
    Date.now()
  );
};

// Error handling helpers
export const createNotificationError = (
  message: string,
  code: string,
  details?: any
) => {
  return {
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
  };
};

export const createNotificationSuccess = (data?: any) => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// Logging helpers
export const logNotificationEvent = (event: string, data?: any) => {
  if (__DEV__) {
    console.log(`🔔 Notification Event: ${event}`, data);
  }
};

export const logNotificationError = (error: any, context?: string) => {
  if (__DEV__) {
    console.error(`❌ Notification Error: ${context || "Unknown"}`, error);
  }
};

// Batch operations helpers
export const batchMarkAsRead = async (
  notificationIds: string[]
): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.map((item) =>
      notificationIds.includes(item.id) ? { ...item, read: true } : item
    );
    return await storage.set(
      NOTIFICATION_KEYS.NOTIFICATION_HISTORY,
      updatedHistory
    );
  } catch (error) {
    console.error("Error batch marking notifications as read:", error);
    return false;
  }
};

export const batchDeleteNotifications = async (
  notificationIds: string[]
): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.filter(
      (item) => !notificationIds.includes(item.id)
    );
    return await storage.set(
      NOTIFICATION_KEYS.NOTIFICATION_HISTORY,
      updatedHistory
    );
  } catch (error) {
    console.error("Error batch deleting notifications:", error);
    return false;
  }
};

// Analytics helpers
export const getNotificationStats = async () => {
  try {
    const history = await getNotificationHistory();
    const total = history.length;
    const read = history.filter((item) => item.read).length;
    const interacted = history.filter((item) => item.interacted).length;
    const unread = total - read;

    return {
      total,
      read,
      unread,
      interacted,
      readRate: total > 0 ? Math.round((read / total) * 100) : 0,
      interactionRate: total > 0 ? Math.round((interacted / total) * 100) : 0,
    };
  } catch (error) {
    console.error("Error getting notification stats:", error);
    return {
      total: 0,
      read: 0,
      unread: 0,
      interacted: 0,
      readRate: 0,
      interactionRate: 0,
    };
  }
};
