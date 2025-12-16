import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  enabled: boolean;
  breakingNews: boolean;
  newArticles: boolean;
  recommendedContent: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  categories: string[]; // Selected category IDs
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
}

export interface NotificationContextType {
  // Permission state
  permissionsGranted: boolean | null;
  requestPermissions: () => Promise<boolean>;

  // Push token
  pushToken: string | null;

  // Notification preferences
  preferences: NotificationPreferences;
  updatePreferences: (
    updates: Partial<NotificationPreferences>
  ) => Promise<void>;

  // Notification management
  sendLocalNotification: (
    title: string,
    body: string,
    data?: any
  ) => Promise<void>;
  scheduleNotification: (
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ) => Promise<string | null>;
  cancelScheduledNotification: (notificationId: string) => Promise<void>;

  // Badge management
  setBadgeCount: (count: number) => Promise<void>;

  // Channel management (Android)
  createNotificationChannel: (
    channelId: string,
    name: string,
    importance: Notifications.AndroidImportance
  ) => Promise<void>;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  breakingNews: true,
  newArticles: true,
  recommendedContent: false,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  categories: [],
  soundEnabled: true,
  vibrationEnabled: true,
  badgeEnabled: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(
    null
  );
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize notification system
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        setPermissionsGranted(false);
        setIsLoading(false);
        return;
      }

      // Load saved preferences
      await loadPreferences();

      // Check current permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionsGranted(status === "granted");

      // Get push token if permissions are granted
      if (status === "granted") {
        await registerForPushNotificationsAsync();
      }

      // Set up notification listeners
      setupNotificationListeners();
    } catch (error) {
      console.error("Error initializing notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem(
        "notification_preferences"
      );
      if (storedPreferences) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(storedPreferences),
        });
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(
        "notification_preferences",
        JSON.stringify(newPreferences)
      );
    } catch (error) {
      console.error("Error saving notification preferences:", error);
    }
  };

  const setupNotificationListeners = () => {
    // Handle notification received when app is in foreground
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        // Handle foreground notification logic here
      });

    // Handle notification interaction (user taps notification)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Handle notification tap logic here
        // e.g., navigate to specific screen based on notification data
        handleNotificationResponse(response);
      });

    // Cleanup function
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  };

  const handleNotificationResponse = (
    response: Notifications.NotificationResponse
  ) => {
    const { notification } = response;
    const data = notification.request.content.data;

    // Handle navigation based on notification data
    if (data?.postId) {
      // Navigate to specific post
      // Example: router.push(`/post/${data.postId}`);
    } else if (data?.category) {
      // Navigate to category
      // Example: router.push(`/categories/${data.category}`);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if (!Device.isDevice) {
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setPermissionsGranted(false);
        return false;
      }

      setPermissionsGranted(true);
      await registerForPushNotificationsAsync();
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      if (!Device.isDevice) {
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID || "your-project-id",
      });

      setPushToken(token.data);

      // Store token for backend integration
      await AsyncStorage.setItem("push_token", token.data);

      // Configure Android channel
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "Default Notifications",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });

        Notifications.setNotificationChannelAsync("breaking-news", {
          name: "Breaking News",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const updatePreferences = async (
    updates: Partial<NotificationPreferences>
  ) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const sendLocalNotification = async (
    title: string,
    body: string,
    data?: any
  ) => {
    if (!preferences.enabled || permissionsGranted !== true) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: preferences.soundEnabled ? "default" : undefined,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error sending local notification:", error);
    }
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string | null> => {
    if (!preferences.enabled || permissionsGranted !== true) {
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: preferences.soundEnabled ? "default" : undefined,
        },
        trigger,
      });
      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  };

  const cancelScheduledNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling scheduled notification:", error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  };

  const createNotificationChannel = async (
    channelId: string,
    name: string,
    importance: Notifications.AndroidImportance
  ) => {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(channelId, {
          name,
          importance,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });
      }
    } catch (error) {
      console.error("Error creating notification channel:", error);
    }
  };

  const value: NotificationContextType = {
    permissionsGranted,
    requestPermissions,
    pushToken,
    preferences,
    updatePreferences,
    sendLocalNotification,
    scheduleNotification,
    cancelScheduledNotification,
    setBadgeCount,
    createNotificationChannel,
  };

  // Show loading state while initializing
  if (isLoading) {
    return null;
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook for using notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
