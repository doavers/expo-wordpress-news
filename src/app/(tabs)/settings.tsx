import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { useAppContext } from "@/contexts/AppContext";
import { useNotifications } from "@/providers/NotificationProvider";
import { bookmarkService } from "@/services";
import i18nService from "@/services/i18n";
import authService from "@/services/auth";
import { Theme } from "@/types/theme";
import { AuthState } from "@/types/auth";
import { resetFirstLaunch } from "@/utils/welcomeUtils";

export default function SettingsPage() {
  const { themeState, setTheme, setLanguage, language } = useAppContext();
  const { permissionsGranted, preferences } = useNotifications();
  const [availableLanguages, setAvailableLanguages] = useState(
    i18nService.getAvailableLanguages()
  );
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Subscribe to language changes to update the available languages display
    const unsubscribe = i18nService.subscribe(() => {
      setAvailableLanguages(i18nService.getAvailableLanguages());
    });

    return unsubscribe;
  }, []);

  const handleThemeChange = async (selectedTheme: Theme) => {
    await setTheme(selectedTheme);
  };

  const handleLanguageChange = async (selectedLanguage: "en" | "id") => {
    await setLanguage(selectedLanguage);
    await i18nService.setLanguage(selectedLanguage);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const clearAllBookmarks = () => {
    Alert.alert(
      "Clear All Bookmarks",
      "Are you sure you want to remove all bookmarks? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await bookmarkService.clearAllBookmarks();
              Alert.alert("Success", "All bookmarks have been cleared");
            } catch (error) {
              console.error("Error clearing bookmarks:", error);
              Alert.alert("Error", "Failed to clear bookmarks");
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    router.push("/about");
  };

  const resetWelcomeScreen = () => {
    Alert.alert(
      "Reset Welcome Screen",
      "This will show the welcome screen again on next app launch. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "default",
          onPress: async () => {
            try {
              await resetFirstLaunch();
              Alert.alert(
                "Success",
                "Welcome screen will appear on next app launch"
              );
            } catch (error) {
              console.error("Error resetting welcome screen:", error);
              Alert.alert("Error", "Failed to reset welcome screen");
            }
          },
        },
      ]
    );
  };

  const handleNotificationSettings = () => {
    router.push("/notifications/settings");
  };

  const handleNotificationHistory = () => {
    router.push("/notifications/history");
  };

  const getNotificationStatusColor = () => {
    if (permissionsGranted === null) return themeState.colors.textSecondary;
    if (permissionsGranted) return "#28a745"; // Green
    return "#dc3545"; // Red
  };

  const getNotificationStatusText = () => {
    if (permissionsGranted === null) return "Loading...";
    if (permissionsGranted) return "Enabled";
    return "Disabled";
  };

  const getThemeButtonStyle = (selectedTheme: Theme) => {
    return [
      styles.optionButton,
      themeState.theme === selectedTheme && {
        backgroundColor: themeState.colors.primary,
      },
    ];
  };

  const getThemeButtonTextStyle = (selectedTheme: Theme) => {
    return [
      styles.optionButtonText,
      themeState.theme === selectedTheme && {
        color: "#FFFFFF",
      },
    ];
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.headerTitle}>
            {i18nService.t("settings.title") || "Settings"}
          </ThemedText>
        </View>
        {/* User Account Section */}
        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            Account
          </ThemedText>
          {authState.isAuthenticated && authState.user ? (
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>
                  {authState.user.name || authState.user.email}
                </ThemedText>
                <ThemedText style={styles.userEmail}>
                  {authState.user.email}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={handleProfile}
              >
                <ThemedText style={styles.profileButtonText}>
                  {i18nService.t("navigation.profile") || "Profile"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authButtonsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, styles.loginButton]}
                onPress={() => router.push("/login")}
              >
                <ThemedText
                  style={[styles.optionButtonText, styles.loginButtonText]}
                >
                  {i18nService.t("auth.login") || "Login"}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, styles.registerButton]}
                onPress={() => router.push("/register")}
              >
                <ThemedText
                  style={[styles.optionButtonText, styles.registerButtonText]}
                >
                  {i18nService.t("auth.register") || "Register"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            {i18nService.t("settings.theme")}
          </ThemedText>
          <View style={styles.rowOptions}>
            {(["light", "dark", "system"] as Theme[]).map((themeOption) => (
              <TouchableOpacity
                key={themeOption}
                style={getThemeButtonStyle(themeOption)}
                onPress={() => handleThemeChange(themeOption)}
              >
                <ThemedText style={getThemeButtonTextStyle(themeOption)}>
                  {i18nService.t(`settings.${themeOption}` as any)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            {i18nService.t("settings.language")}
          </ThemedText>
          <View style={styles.rowOptions}>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionButton,
                  language === lang.code && {
                    backgroundColor: themeState.colors.primary,
                  },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    language === lang.code && {
                      color: "#FFFFFF",
                    },
                  ]}
                >
                  {lang.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            Notifications
          </ThemedText>
          <View style={styles.statusContainer}>
            <ThemedText style={styles.statusLabel}>Status:</ThemedText>
            <ThemedText
              style={[
                styles.statusValue,
                { color: getNotificationStatusColor() },
              ]}
            >
              {getNotificationStatusText()}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleNotificationSettings}
          >
            <ThemedText style={styles.optionButtonText}>
              Notification Settings
            </ThemedText>
          </TouchableOpacity>
          {permissionsGranted && (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleNotificationHistory}
            >
              <ThemedText style={styles.optionButtonText}>
                Notification History
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Notification Toggles */}
        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            Quick Toggles
          </ThemedText>
          <View style={styles.quickTogglesContainer}>
            <TouchableOpacity
              style={[
                styles.quickToggle,
                {
                  backgroundColor: preferences?.breakingNews
                    ? themeState.colors.primary
                    : themeState.colors.card,
                  borderColor: themeState.colors.border,
                },
              ]}
              onPress={() => {
                // Toggle breaking news notifications
                // This would integrate with notification service
                console.log("Toggle breaking news");
              }}
            >
              <ThemedText
                style={[
                  styles.quickToggleText,
                  {
                    color: preferences?.breakingNews
                      ? "white"
                      : themeState.colors.text,
                  },
                ]}
              >
                Breaking News
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickToggle,
                {
                  backgroundColor: preferences?.newArticles
                    ? themeState.colors.primary
                    : themeState.colors.card,
                  borderColor: themeState.colors.border,
                },
              ]}
              onPress={() => {
                // Toggle new article notifications
                console.log("Toggle new articles");
              }}
            >
              <ThemedText
                style={[
                  styles.quickToggleText,
                  {
                    color: preferences?.newArticles
                      ? "white"
                      : themeState.colors.text,
                  },
                ]}
              >
                New Articles
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickToggle,
                {
                  backgroundColor: preferences?.recommendedContent
                    ? themeState.colors.primary
                    : themeState.colors.card,
                  borderColor: themeState.colors.border,
                },
              ]}
              onPress={() => {
                // Toggle recommended content notifications
                console.log("Toggle recommended content");
              }}
            >
              <ThemedText
                style={[
                  styles.quickToggleText,
                  {
                    color: preferences?.recommendedContent
                      ? "white"
                      : themeState.colors.text,
                  },
                ]}
              >
                Recommended
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            {i18nService.t("settings.dataManagement")}
          </ThemedText>
          <TouchableOpacity
            style={[styles.optionButton, styles.dangerButton]}
            onPress={clearAllBookmarks}
          >
            <ThemedText
              style={[styles.optionButtonText, styles.dangerButtonText]}
            >
              {i18nService.t("bookmarks.clearAll")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            {i18nService.t("settings.appInformation")}
          </ThemedText>
          <TouchableOpacity style={styles.optionButton} onPress={handleAbout}>
            <ThemedText style={styles.optionButtonText}>
              {i18nService.t("navigation.aboutNewsHub")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.resetButton]}
            onPress={resetWelcomeScreen}
          >
            <ThemedText style={styles.optionButtonText}>
              Reset Welcome Screen
            </ThemedText>
          </TouchableOpacity>
          <View style={styles.appInfo}>
            <ThemedText style={styles.appInfoText}>
              {i18nService.t("settings.version")}: 1.0.0
            </ThemedText>
            <ThemedText style={styles.appInfoText}>
              {i18nService.t("settings.source")}: blog.doavers.com
            </ThemedText>
          </View>
        </View>

        {authState.isAuthenticated && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.optionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <ThemedText
                style={[styles.optionButtonText, styles.logoutButtonText]}
              >
                {i18nService.t("auth.logout")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  userInfoContainer: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    padding: 16,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  profileButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  profileButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  authButtonsContainer: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: "#007AFF",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  registerButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  options: {
    gap: 12,
  },
  rowOptions: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 12,
  },
  logoutButtonText: {
    color: "#FF3B30",
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  dangerButtonText: {
    color: "#FF3B30",
  },
  appInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8,
  },
  appInfoText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  resetButton: {
    marginTop: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  quickTogglesContainer: {
    gap: 12,
    marginTop: 16,
  },
  quickToggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  quickToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
