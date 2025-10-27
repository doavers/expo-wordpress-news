import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { Button } from "@/components/Button";
import authService from "@/services/auth";
import i18nService from "@/services/i18n";

export default function HomePage() {
  const authState = authService.getState();

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleLoginPress = () => {
    router.push("/login");
  };

  const handleAboutPress = () => {
    router.push("/about");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.title}>
            {authState.isAuthenticated
              ? `Welcome, ${authState.user?.email}!`
              : "Welcome to Expo Starter App"}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText variant='secondary' style={styles.description}>
            A multi-purpose Expo React Native starter application with
            authentication, internationalization, and theme support.
          </ThemedText>

          <View style={styles.buttons}>
            {authState.isAuthenticated ? (
              <Button
                title={i18nService.t("navigation.profile")}
                onPress={handleProfilePress}
                style={styles.button}
              />
            ) : (
              <Button
                title={i18nService.t("auth.login")}
                onPress={handleLoginPress}
                style={styles.button}
              />
            )}

            <Button
              title={i18nService.t("navigation.about")}
              onPress={handleAboutPress}
              variant='secondary'
              style={styles.button}
            />

            <Button
              title={i18nService.t("navigation.settings")}
              onPress={handleSettingsPress}
              variant='secondary'
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  description: {
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  buttons: {
    gap: 16,
  },
  button: {
    marginBottom: 8,
  },
});
