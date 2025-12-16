import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/AppContext";
import { useNotifications } from "@/providers/NotificationProvider";
import {
  NotificationCategories,
  NotificationPreferencesSection,
  NotificationPermissionStatus,
  PushTokenDisplay,
  QuietHoursSettings,
} from "@/components/NotificationSettings";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/constants/notifications";
import { NotificationPreferences } from "@/types/notifications";

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const { permissionsGranted, pushToken, preferences, updatePreferences } =
    useNotifications();

  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreferences>(
      preferences || DEFAULT_NOTIFICATION_PREFERENCES
    );

  useEffect(() => {
    setLocalPreferences(preferences || DEFAULT_NOTIFICATION_PREFERENCES);
  }, [preferences]);

  const handlePreferencesChange = async (
    updates: Partial<NotificationPreferences>
  ) => {
    const newPreferences = { ...localPreferences, ...updates };
    setLocalPreferences(newPreferences);

    try {
      await updatePreferences(updates);
    } catch (error) {
      console.error("Error updating preferences:", error);
      // Revert on error
      setLocalPreferences(preferences || DEFAULT_NOTIFICATION_PREFERENCES);
      Alert.alert("Error", "Failed to update notification preferences");
    }
  };

  const handleTestNotification = async () => {
    try {
      const { sendLocalNotification } = useNotifications();
      await sendLocalNotification(
        "Test Notification",
        "This is a test notification from your WordPress News app",
        {
          type: "custom",
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const handleResetPreferences = async () => {
    Alert.alert(
      "Reset Preferences",
      "Are you sure you want to reset all notification preferences to their default values?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await handlePreferencesChange(DEFAULT_NOTIFICATION_PREFERENCES);
              Alert.alert(
                "Success",
                "Notification preferences have been reset"
              );
            } catch (error) {
              console.error("Error resetting preferences:", error);
              Alert.alert("Error", "Failed to reset preferences");
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Notification Settings",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerBackVisible: true,
          headerBackTitle: "Home",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Status */}
        <NotificationPermissionStatus
          onRequestPermissions={async () => {
            try {
              const { requestPermissions } = useNotifications();
              return await requestPermissions();
            } catch (error) {
              console.error("Error requesting permissions:", error);
              return false;
            }
          }}
        />

        {/* Main Settings */}
        <ThemedView
          style={[styles.section, { backgroundColor: colors.background }]}
        >
          <ThemedText style={styles.sectionTitle}>General Settings</ThemedText>

          <NotificationCategories
            preferences={localPreferences}
            onPreferencesChange={handlePreferencesChange}
          />

          <QuietHoursSettings
            preferences={localPreferences}
            onPreferencesChange={handlePreferencesChange}
          />

          <NotificationPreferencesSection
            preferences={localPreferences}
            onPreferencesChange={handlePreferencesChange}
          />
        </ThemedView>

        {/* Test Section */}
        {permissionsGranted && (
          <ThemedView
            style={[styles.section, { backgroundColor: colors.background }]}
          >
            <ThemedText style={styles.sectionTitle}>Testing</ThemedText>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.primary }]}
              onPress={handleTestNotification}
            >
              <ThemedText style={styles.testButtonText}>
                Send Test Notification
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Debug Information */}
        {__DEV__ && (
          <>
            <PushTokenDisplay token={pushToken} />

            <ThemedView
              style={[styles.section, { backgroundColor: colors.background }]}
            >
              <ThemedText style={styles.sectionTitle}>
                Debug Information
              </ThemedText>

              <ThemedText style={styles.debugText}>
                Permissions Granted: {permissionsGranted ? "Yes" : "No"}
              </ThemedText>
              <ThemedText style={styles.debugText}>
                Push Token: {pushToken ? "Available" : "Not Available"}
              </ThemedText>
              <ThemedText style={styles.debugText}>
                Global Enabled: {localPreferences.enabled ? "Yes" : "No"}
              </ThemedText>
              <ThemedText style={styles.debugText}>
                Breaking News: {localPreferences.breakingNews ? "Yes" : "No"}
              </ThemedText>
              <ThemedText style={styles.debugText}>
                New Articles: {localPreferences.newArticles ? "Yes" : "No"}
              </ThemedText>
            </ThemedView>
          </>
        )}

        {/* Reset Section */}
        <ThemedView
          style={[styles.section, { backgroundColor: colors.background }]}
        >
          <ThemedText style={styles.sectionTitle}>Reset</ThemedText>

          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={handleResetPreferences}
          >
            <ThemedText
              style={[styles.resetButtonText, { color: colors.text }]}
            >
              Reset to Default Settings
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Help Section */}
        <ThemedView
          style={[styles.section, { backgroundColor: colors.background }]}
        >
          <ThemedText style={styles.sectionTitle}>Help</ThemedText>

          <View style={styles.helpItem}>
            <ThemedText style={styles.helpTitle}>
              About Notifications
            </ThemedText>
            <ThemedText
              style={[styles.helpDescription, { color: colors.textSecondary }]}
            >
              Get notified about breaking news, new articles, and personalized
              recommendations.
            </ThemedText>
          </View>

          <View style={styles.helpItem}>
            <ThemedText style={styles.helpTitle}>Quiet Hours</ThemedText>
            <ThemedText
              style={[styles.helpDescription, { color: colors.textSecondary }]}
            >
              Temporarily silence notifications during specific hours to avoid
              interruptions.
            </ThemedText>
          </View>

          <View style={styles.helpItem}>
            <ThemedText style={styles.helpTitle}>Categories</ThemedText>
            <ThemedText
              style={[styles.helpDescription, { color: colors.textSecondary }]}
            >
              Choose which types of notifications you want to receive based on
              your interests.
            </ThemedText>
          </View>
        </ThemedView>
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
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  debugText: {
    fontSize: 14,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  helpItem: {
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
