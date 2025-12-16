import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useTheme } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { NotificationData } from "@/types/notifications";

interface NotificationPreviewProps {
  title: string;
  body: string;
  data?: NotificationData;
  imageUrl?: string;
  timestamp?: Date;
  onPress?: () => void;
  onDismiss?: () => void;
  style?: any;
}

interface NotificationActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

export function NotificationPreview({
  title,
  body,
  data,
  imageUrl,
  timestamp = new Date(),
  onPress,
  onDismiss,
  style,
}: NotificationPreviewProps) {
  const theme = useTheme();
  const colors = theme.colors;

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "breaking_news":
        return "flash";
      case "new_article":
        return "document-text";
      case "recommended":
        return "heart";
      case "system":
        return "settings";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case "breaking_news":
        return "#dc3545";
      case "new_article":
        return "#007bff";
      case "recommended":
        return "#28a745";
      case "system":
        return "#6c757d";
      default:
        return colors.primary;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const iconType = data?.type;
  const iconColor = getNotificationColor(iconType);
  const iconName = getNotificationIcon(iconType);

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: "#000",
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconColor + "20" },
            ]}
          >
            <Ionicons name={iconName} size={16} color={iconColor} />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {title}
            </ThemedText>
            {timestamp && (
              <ThemedText
                style={[styles.timestamp, { color: colors.textSecondary }]}
              >
                {formatTime(timestamp)}
              </ThemedText>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name='close' size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Image */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode='cover'
          />
        )}

        {/* Body Text */}
        <ThemedText
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {body}
        </ThemedText>
      </View>

      {/* Actions */}
      {onPress && (
        <View style={styles.actions}>
          <NotificationAction
            title='Read'
            icon='book-outline'
            onPress={onPress}
            color={colors.primary}
          />
          <NotificationAction
            title='Save'
            icon='bookmark-outline'
            onPress={() => {
              // Handle save action
              console.log("Save notification:", data);
            }}
          />
          <NotificationAction
            title='Share'
            icon='share-outline'
            onPress={() => {
              // Handle share action
              console.log("Share notification:", data);
            }}
          />
        </View>
      )}
    </ThemedView>
  );
}

// Interactive notification with action buttons
interface InteractiveNotificationProps {
  notification: Notifications.Notification;
  onActionPress: (actionId: string) => void;
  onDismiss: () => void;
}

export function InteractiveNotification({
  notification,
  onActionPress,
  onDismiss,
}: InteractiveNotificationProps) {
  const theme = useTheme();
  const colors = theme.colors;

  const data = notification.request.content.data as any;
  const actions = (notification.request.content as any).actions || [];

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {notification.request.content.title}
        </ThemedText>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name='close' size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {notification.request.content.body}
        </ThemedText>
      </View>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <View style={styles.interactiveActions}>
          {actions.map((action: any) => (
            <TouchableOpacity
              key={action.identifier}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => onActionPress(action.identifier!)}
            >
              <ThemedText style={styles.actionButtonText}>
                {action.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

// Notification action button component
function NotificationAction({
  title,
  icon,
  onPress,
  color,
}: NotificationActionProps) {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: color || colors.primary,
          borderColor: color || colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color='white' style={styles.actionIcon} />
      <ThemedText style={styles.actionButtonText}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

// Rich notification with media support
interface RichNotificationProps {
  notification: Notifications.Notification;
  onMediaPress?: () => void;
  onLinkPress?: (url: string) => void;
}

export function RichNotification({
  notification,
  onMediaPress,
  onLinkPress,
}: RichNotificationProps) {
  const theme = useTheme();
  const colors = theme.colors;

  // Safely convert notification data to NotificationData with fallback
  const rawData = notification.request.content.data as Record<string, unknown>;
  const data: NotificationData = {
    type: (rawData.type as NotificationData["type"]) || "custom",
    postId: rawData.postId as string,
    categoryId: rawData.categoryId as string,
    authorId: rawData.authorId as string,
    priority: rawData.priority as NotificationData["priority"],
    imageUrl: rawData.imageUrl as string,
    url: rawData.url as string,
    customData: rawData.customData as Record<string, any>,
  };
  const hasImage = !!data?.imageUrl;
  // Check for video URL in customData or directly in rawData
  const hasVideo = !!(
    data?.customData?.videoUrl || (rawData.videoUrl as string)
  );
  const hasLink = !!data?.url;

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {notification.request.content.title}
        </ThemedText>
        <TouchableOpacity style={styles.dismissButton}>
          <Ionicons name='close' size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Media Preview */}
      {(hasImage || hasVideo) && (
        <TouchableOpacity style={styles.mediaPreview} onPress={onMediaPress}>
          {hasImage && (
            <Image
              source={{ uri: data.imageUrl }}
              style={styles.mediaImage}
              resizeMode='cover'
            />
          )}
          {hasVideo && (
            <View style={styles.videoPlaceholder}>
              <Ionicons name='play-circle' size={32} color='white' />
            </View>
          )}
          <View style={styles.mediaOverlay}>
            <Ionicons name='expand' size={16} color='white' />
          </View>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <ThemedText
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {notification.request.content.body}
        </ThemedText>
      </View>

      {/* Link Action */}
      {hasLink && (
        <TouchableOpacity
          style={[
            styles.linkButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onLinkPress?.(data.url!)}
        >
          <ThemedText style={styles.linkButtonText}>Open Link</ThemedText>
          <Ionicons
            name='open-outline'
            size={16}
            color='white'
            style={styles.linkIcon}
          />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  dismissButton: {
    padding: 4,
  },
  content: {
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  interactiveActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
    marginTop: 12,
  },
  mediaPreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  mediaOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  linkIcon: {
    marginLeft: 8,
  },
});
