import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAppContext } from "@/contexts/AppContext";
import {
  getNotificationHistory,
  markNotificationAsRead,
  batchMarkAsRead,
  clearNotificationHistory,
} from "@/utils/notificationHelpers";
import { NotificationHistory } from "@/types/notifications";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationHistoryScreen() {
  const { themeState } = useAppContext();
  const colors = themeState.colors;

  const [notificationHistory, setNotificationHistory] = useState<
    NotificationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      const history = await getNotificationHistory();
      setNotificationHistory(history);
    } catch (error) {
      console.error("Error loading notification history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotificationHistory();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      loadNotificationHistory();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await batchMarkAsRead(selectedNotifications);
      setSelectedNotifications([]);
      loadNotificationHistory();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all notification history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearNotificationHistory();
              loadNotificationHistory();
            } catch (error) {
              console.error("Error clearing notification history:", error);
            }
          },
        },
      ]
    );
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
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

  const getNotificationColor = (type: string) => {
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

  if (loading) {
    return (
      <ThemedView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Stack.Screen
          options={{
            title: "Notification History",
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerBackVisible: true,
            headerBackTitle: "Home",
          }}
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading notification history...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Notification History",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerBackVisible: true,
          headerBackTitle: "Home",
          headerRight: () =>
            notificationHistory.length > 0 ? (
              <TouchableOpacity onPress={handleClearHistory}>
                <Ionicons
                  name='trash-outline'
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Selection Actions */}
        {selectedNotifications.length > 0 && (
          <ThemedView
            style={[
              styles.selectionBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText style={styles.selectionText}>
              {selectedNotifications.length} selected
            </ThemedText>
            <TouchableOpacity onPress={handleMarkSelectedAsRead}>
              <ThemedText
                style={[styles.selectionAction, { color: colors.primary }]}
              >
                Mark as Read
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* History List */}
        {notificationHistory.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons
              name='notifications-off-outline'
              size={48}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No notification history
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Your notifications will appear here
            </ThemedText>
          </ThemedView>
        ) : (
          notificationHistory.map((notification) => {
            const isSelected = selectedNotifications.includes(notification.id);
            const iconColor = getNotificationColor(notification.data.type);

            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: notification.read
                      ? colors.card
                      : colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  if (selectedNotifications.length > 0) {
                    handleSelectNotification(notification.id);
                  } else {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                    // Handle navigation or other actions here
                  }
                }}
                onLongPress={() => handleSelectNotification(notification.id)}
              >
                <View style={styles.notificationContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: iconColor + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.data.type)}
                      size={16}
                      color={iconColor}
                    />
                  </View>

                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <ThemedText
                        style={[
                          styles.title,
                          {
                            color: notification.read
                              ? colors.textSecondary
                              : colors.text,
                          },
                        ]}
                      >
                        {notification.title}
                      </ThemedText>
                      <ThemedText
                        style={[styles.time, { color: colors.textSecondary }]}
                      >
                        {formatNotificationTime(notification.receivedAt)}
                      </ThemedText>
                    </View>

                    <ThemedText
                      style={[styles.body, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {notification.body}
                    </ThemedText>

                    {notification.interacted && (
                      <ThemedText
                        style={[
                          styles.interactedText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Opened
                      </ThemedText>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleSelectNotification(notification.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : "transparent",
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name='checkmark' size={12} color='white' />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectionAction: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  notificationItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  interactedText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  checkboxContainer: {
    marginLeft: 8,
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
