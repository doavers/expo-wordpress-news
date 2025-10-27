import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { useAppContext } from "@/contexts/AppContext";
import i18nService from "@/services/i18n";
import authService from "@/services/auth";
import { Theme } from "@/types/theme";

export default function SettingsPage() {
  const { themeState, setTheme, setLanguage, language } = useAppContext();

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
        <View style={styles.section}>
          <ThemedText variant='primary' style={styles.sectionTitle}>
            {i18nService.t("settings.theme")}
          </ThemedText>
          <View style={styles.options}>
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
          <View style={styles.options}>
            {i18nService.getAvailableLanguages().map((lang) => (
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

        {authService.getState().isAuthenticated && (
          <View style={styles.section}>
            <ThemedText variant='primary' style={styles.sectionTitle}>
              Account
            </ThemedText>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleProfile}
            >
              <ThemedText style={styles.optionButtonText}>
                {i18nService.t("navigation.profile")}
              </ThemedText>
            </TouchableOpacity>
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
  options: {
    gap: 12,
  },
  optionButton: {
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
});
