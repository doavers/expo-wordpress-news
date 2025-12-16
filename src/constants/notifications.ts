import * as Notifications from "expo-notifications";
import {
  NotificationChannel,
  NotificationCategory,
} from "@/types/notifications";

// Notification Storage Keys
export const NOTIFICATION_KEYS = {
  PERMISSIONS: "notification_permissions",
  PREFERENCES: "notification_preferences",
  PUSH_TOKEN: "push_token",
  TOKEN_REGISTERED: "push_token_registered",
  LAST_PERMISSION_REQUEST: "last_permission_request",
  NOTIFICATION_HISTORY: "notification_history",
  SCHEDULED_NOTIFICATIONS: "scheduled_notifications",
  ANALYTICS: "notification_analytics",
  CATEGORIES: "notification_categories",
} as const;

// Default Notification Channels (Android)
export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: "default",
    name: "Default Notifications",
    description: "General app notifications",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    enableLights: true,
    lightColor: "#0066CC",
    enableVibrate: true,
  },
  {
    id: "breaking-news",
    name: "Breaking News",
    description: "Urgent news updates and breaking stories",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 150, 250, 150, 250],
    enableLights: true,
    lightColor: "#FF0000",
    enableVibrate: true,
    bypassDnd: true,
  },
  {
    id: "new-articles",
    name: "New Articles",
    description: "New articles in your followed categories",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 250],
    enableLights: true,
    lightColor: "#00AA00",
    enableVibrate: true,
  },
  {
    id: "recommended",
    name: "Recommended Content",
    description: "Personalized content recommendations",
    importance: Notifications.AndroidImportance.LOW,
    sound: "default",
    vibrationPattern: [0, 100],
    enableLights: false,
    enableVibrate: false,
  },
  {
    id: "system",
    name: "System Updates",
    description: "App updates and system notifications",
    importance: Notifications.AndroidImportance.MIN,
    sound: "default",
    vibrationPattern: [0, 50],
    enableLights: false,
    enableVibrate: false,
  },
];

// Default News Categories
export const DEFAULT_CATEGORIES: NotificationCategory[] = [
  {
    id: "politics",
    name: "Politics",
    description: "Political news and updates",
  },
  {
    id: "technology",
    name: "Technology",
    description: "Tech news and innovations",
  },
  {
    id: "business",
    name: "Business",
    description: "Business and finance news",
  },
  { id: "sports", name: "Sports", description: "Sports news and updates" },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Entertainment and culture",
  },
  { id: "health", name: "Health", description: "Health and wellness news" },
  { id: "science", name: "Science", description: "Science and discoveries" },
  { id: "world", name: "World", description: "International news" },
  { id: "local", name: "Local", description: "Local news and events" },
];

// Notification Templates
export const NOTIFICATION_TEMPLATES = {
  BREAKING_NEWS: {
    id: "breaking-news",
    name: "Breaking News",
    title: "Breaking: {title}",
    body: "{summary}",
  },
  NEW_ARTICLE: {
    id: "new-article",
    name: "New Article",
    title: "New Article: {title}",
    body: "{author} • {category}",
  },
  RECOMMENDED: {
    id: "recommended",
    name: "Recommended",
    title: "Recommended for you",
    body: "{title} might interest you",
  },
  DAILY_DIGEST: {
    id: "daily-digest",
    name: "Daily Digest",
    title: "Daily News Digest",
    body: "{count} new articles to read",
  },
  TRENDING: {
    id: "trending",
    name: "Trending Now",
    title: "Trending: {title}",
    body: "{reads} reads • {category}",
  },
} as const;

// Notification Limits and Constraints
export const NOTIFICATION_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_BODY_LENGTH: 255,
  MAX_CUSTOM_DATA_SIZE: 4096, // bytes
  MAX_SCHEDULED_NOTIFICATIONS: 64,
  MAX_NOTIFICATION_HISTORY: 100,
  MAX_BATCH_NOTIFICATIONS: 100,
  DEFAULT_QUIET_HOURS_START: "22:00",
  DEFAULT_QUIET_HOURS_END: "08:00",
  MIN_PERMISSION_REQUEST_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in ms
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
} as const;

// API Endpoints
export const NOTIFICATION_API_ENDPOINTS = {
  REGISTER_TOKEN: "/api/v1/notifications/register",
  UPDATE_PREFERENCES: "/api/v1/notifications/preferences",
  GET_HISTORY: "/api/v1/notifications/history",
  MARK_READ: "/api/v1/notifications/{id}/read",
  BATCH_DELETE: "/api/v1/notifications/batch-delete",
  ANALYTICS: "/api/v1/notifications/analytics",
  CAMPAIGNS: "/api/v1/notifications/campaigns",
} as const;

// Error Messages
export const NOTIFICATION_ERRORS = {
  PERMISSION_DENIED: "Notification permission denied",
  DEVICE_NOT_SUPPORTED: "Push notifications are not supported on this device",
  TOKEN_GENERATION_FAILED: "Failed to generate push token",
  REGISTRATION_FAILED: "Failed to register push token",
  NETWORK_ERROR: "Network connection required for push notifications",
  INVALID_DATA: "Invalid notification data",
  RATE_LIMIT_EXCEEDED: "Too many notification requests",
  SCHEDULING_FAILED: "Failed to schedule notification",
  CHANNEL_CREATION_FAILED: "Failed to create notification channel",
  STORAGE_ERROR: "Failed to save notification data",
  INVALID_CHANNEL_ID: "Invalid notification channel ID",
  INVALID_TRIGGER: "Invalid notification trigger",
  TITLE_TOO_LONG: "Notification title exceeds maximum length",
  BODY_TOO_LONG: "Notification body exceeds maximum length",
} as const;

// Success Messages
export const NOTIFICATION_SUCCESS_MESSAGES = {
  PERMISSIONS_GRANTED: "Notification permissions granted",
  TOKEN_REGISTERED: "Push token registered successfully",
  PREFERENCES_SAVED: "Notification preferences saved",
  NOTIFICATION_SENT: "Notification sent successfully",
  NOTIFICATION_SCHEDULED: "Notification scheduled successfully",
  CHANNEL_CREATED: "Notification channel created successfully",
  BATCH_PROCESSED: "Batch notifications processed successfully",
  ANALYTICS_RECORDED: "Notification analytics recorded",
} as const;

// Notification Priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Notification Frequencies
export const NOTIFICATION_FREQUENCIES = {
  REALTIME: "realtime",
  HOURLY: "hourly",
  DAILY: "daily",
  WEEKLY: "weekly",
  NEVER: "never",
} as const;

// Debugging and Development
export const NOTIFICATION_DEBUG = {
  ENABLE_CONSOLE_LOGGING: __DEV__,
  LOG_NOTIFICATION_EVENTS: __DEV__,
  SHOW_NOTIFICATION_CONTENT: __DEV__,
  SIMULATE_PUSH_NOTIFICATIONS: __DEV__,
  DEBUG_PERMISSION_REQUESTS: __DEV__,
} as const;

// Exports for convenience
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  breakingNews: true,
  newArticles: true,
  recommendedContent: false,
  quietHours: {
    enabled: false,
    start: NOTIFICATION_LIMITS.DEFAULT_QUIET_HOURS_START,
    end: NOTIFICATION_LIMITS.DEFAULT_QUIET_HOURS_END,
  },
  categories: [] as string[],
  soundEnabled: true,
  vibrationEnabled: true,
  badgeEnabled: true,
};
