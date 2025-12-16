import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useAppContext } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/providers/NotificationProvider";
import {
  shouldRequestPermissions,
  setPermissionRequestTimestamp,
} from "@/utils/notificationHelpers";

interface NotificationBannerProps {
  onDismiss?: () => void;
  onEnable?: () => void;
  style?: any;
}

export function NotificationBanner({
  onDismiss,
  onEnable,
  style,
}: NotificationBannerProps) {
  const { permissionsGranted, requestPermissions } = useNotifications();
  const { themeState: theme } = useAppContext();
  const colors = theme.colors;

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    checkShowBanner();
  }, [permissionsGranted]);

  const checkShowBanner = async () => {
    if (permissionsGranted === false) {
      const shouldShow = await shouldRequestPermissions();
      if (shouldShow) {
        showBanner();
      }
    } else if (permissionsGranted === true) {
      hideBanner();
    }
  };

  const showBanner = () => {
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const hideBanner = () => {
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start(() => {
      setVisible(false);
    });
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await requestPermissions();
      if (granted) {
        await setPermissionRequestTimestamp();
        onEnable?.();
        hideBanner();
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setPermissionRequestTimestamp().catch(console.error);
    onDismiss?.();
    hideBanner();
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name='notifications' size={24} color={colors.primary} />
        </View>

        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>Stay Updated</ThemedText>
          <ThemedText
            style={[styles.description, { color: colors.textSecondary }]}
          >
            Enable notifications to get the latest news updates and breaking
            stories
          </ThemedText>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.enableButton, { backgroundColor: colors.primary }]}
            onPress={handleEnableNotifications}
            disabled={loading}
          >
            <ThemedText style={styles.enableButtonText}>
              {loading ? "Loading..." : "Enable"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dismissButton, { borderColor: colors.border }]}
            onPress={handleDismiss}
            disabled={loading}
          >
            <Ionicons name='close' size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

interface NotificationFeatureBannerProps {
  feature: "breaking-news" | "new-articles" | "recommended";
  onEnable: () => void;
  onDismiss: () => void;
  visible: boolean;
}

export function NotificationFeatureBanner({
  feature,
  onEnable,
  onDismiss,
  visible,
}: NotificationFeatureBannerProps) {
  const { themeState: theme } = useAppContext();
  const colors = theme.colors;

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showBanner();
    } else {
      hideBanner();
    }
  }, [visible]);

  const showBanner = () => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const hideBanner = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const getFeatureInfo = () => {
    switch (feature) {
      case "breaking-news":
        return {
          icon: "flash" as const,
          title: "Breaking News Alerts",
          description:
            "Get instant notifications for important breaking stories",
          color: "#dc3545",
        };
      case "new-articles":
        return {
          icon: "document-text" as const,
          title: "New Article Notifications",
          description: "Never miss new articles from your favorite categories",
          color: "#007bff",
        };
      case "recommended":
        return {
          icon: "heart" as const,
          title: "Personalized Recommendations",
          description: "Discover articles tailored to your interests",
          color: "#28a745",
        };
      default:
        return {
          icon: "notifications" as const,
          title: "Notifications",
          description: "Stay updated with the latest content",
          color: colors.primary,
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <Animated.View
      style={[
        styles.featureContainer,
        {
          backgroundColor: colors.card,
          opacity: slideAnim,
          transform: [{ scale: slideAnim }],
          marginVertical: 8,
        },
      ]}
    >
      <View style={styles.featureContent}>
        <View
          style={[
            styles.featureIconContainer,
            { backgroundColor: featureInfo.color + "20" },
          ]}
        >
          <Ionicons
            name={featureInfo.icon}
            size={20}
            color={featureInfo.color}
          />
        </View>

        <View style={styles.featureTextContainer}>
          <ThemedText style={styles.featureTitle}>
            {featureInfo.title}
          </ThemedText>
          <ThemedText
            style={[styles.featureDescription, { color: colors.textSecondary }]}
          >
            {featureInfo.description}
          </ThemedText>
        </View>

        <View style={styles.featureButtons}>
          <TouchableOpacity
            style={[
              styles.featureEnableButton,
              { backgroundColor: featureInfo.color },
            ]}
            onPress={onEnable}
          >
            <ThemedText style={styles.featureEnableButtonText}>
              Enable
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDismiss}>
            <Ionicons name='close' size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

interface NotificationPermissionCardProps {
  onRequestPermissions: () => Promise<boolean>;
}

export function NotificationPermissionCard({
  onRequestPermissions,
}: NotificationPermissionCardProps) {
  const { permissionsGranted } = useNotifications();
  const { themeState: theme } = useAppContext();
  const colors = theme.colors;
  const [loading, setLoading] = useState(false);

  const handleRequestPermissions = async () => {
    setLoading(true);
    try {
      await onRequestPermissions();
    } catch (error) {
      console.error("Error requesting permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (permissionsGranted === true) {
    return (
      <ThemedView style={[styles.card, { backgroundColor: "#d4edda" }]}>
        <Ionicons name='checkmark-circle' size={24} color='#155724' />
        <View style={styles.cardContent}>
          <ThemedText style={[styles.cardTitle, { color: "#155724" }]}>
            Notifications Enabled
          </ThemedText>
          <ThemedText style={[styles.cardDescription, { color: "#155724" }]}>
            You'll receive updates about the latest news and articles
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (permissionsGranted === false) {
    return (
      <ThemedView style={[styles.card, { backgroundColor: "#f8d7da" }]}>
        <Ionicons name='notifications-off' size={24} color='#721c24' />
        <View style={styles.cardContent}>
          <ThemedText style={[styles.cardTitle, { color: "#721c24" }]}>
            Notifications Disabled
          </ThemedText>
          <ThemedText style={[styles.cardDescription, { color: "#721c24" }]}>
            Enable notifications to stay updated with the latest content
          </ThemedText>
          <TouchableOpacity
            style={[styles.cardButton, { backgroundColor: "#dc3545" }]}
            onPress={handleRequestPermissions}
            disabled={loading}
          >
            <ThemedText style={styles.cardButtonText}>
              {loading ? "Loading..." : "Enable Notifications"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
    zIndex: 1000,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  enableButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  enableButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Feature Banner Styles
  featureContainer: {
    borderRadius: 12,
    padding: 16,
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  featureButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureEnableButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureEnableButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Card Styles
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  cardButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
