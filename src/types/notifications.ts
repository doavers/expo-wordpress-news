import * as Notifications from 'expo-notifications';

// Notification Types
export interface NotificationPreferences {
  enabled: boolean;
  breakingNews: boolean;
  newArticles: boolean;
  recommendedContent: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  categories: string[]; // Selected category IDs
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
}

export interface NotificationCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface NotificationData {
  type: 'breaking_news' | 'new_article' | 'recommended' | 'system' | 'custom';
  postId?: string;
  categoryId?: string;
  authorId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  imageUrl?: string;
  url?: string;
  customData?: Record<string, any>;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  trigger: Notifications.NotificationTriggerInput;
  data: NotificationData;
  scheduledAt: Date;
  repeats?: boolean;
}

export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  data: NotificationData;
  receivedAt: Date;
  read: boolean;
  interacted: boolean;
  channelId?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: Notifications.AndroidImportance;
  sound: string;
  vibrationPattern?: number[];
  enableLights?: boolean;
  lightColor?: string;
  enableVibrate?: boolean;
  bypassDnd?: boolean;
}

// API Types
export interface PushTokenResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface NotificationRegistrationRequest {
  token: string;
  platform: 'ios' | 'android';
  deviceInfo?: {
    model: string;
    osVersion: string;
    appVersion: string;
  };
}

export interface NotificationCampaignRequest {
  title: string;
  body: string;
  data: NotificationData;
  targetAudience?: {
    categories?: string[];
    users?: string[];
    all?: boolean;
  };
  scheduledFor?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// Event Types
export interface NotificationEvent {
  type: 'received' | 'pressed' | 'dismissed' | 'failed';
  notification: Notifications.Notification;
  timestamp: Date;
  error?: string;
}

// Settings Types
export type NotificationFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';

export interface NotificationSettings {
  global: {
    enabled: boolean;
    frequency: NotificationFrequency;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    badgeEnabled: boolean;
    previewEnabled: boolean;
  };
  categories: {
    breakingNews: boolean;
    newArticles: boolean;
    recommendedContent: boolean;
    systemUpdates: boolean;
    customNotifications: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    weekendOnly: boolean;
  };
  custom: Record<string, boolean>;
}

// Template Types
export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  data: NotificationData;
  variables?: string[];
  enabled: boolean;
}

// Analytics Types
export interface NotificationAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  dismissed: number;
  failed: number;
  averageResponseTime?: number; // in seconds
}

// Error Types
export class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

// Validation Types
export interface NotificationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export notification data validation functions
export const validateNotificationData = (data: NotificationData): NotificationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.type) {
    errors.push('Notification type is required');
  }

  if (data.type === 'new_article' && !data.postId) {
    warnings.push('New article notifications should include postId');
  }

  if (data.type === 'custom' && !data.customData) {
    warnings.push('Custom notifications should include customData');
  }

  if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Invalid priority value');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};