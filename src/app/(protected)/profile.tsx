import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { Button } from "@/components/Button";
import authService from "@/services/auth";
import i18nService from "@/services/i18n";
import { AuthState } from "@/types/auth";

export default function ProfilePage() {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleBack = () => {
    router.back();
  };

  if (!authState.isAuthenticated) {
    return null; // This should be handled by the router redirect
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.title}>
            {i18nService.t("profile.title")}
          </ThemedText>
          <Button
            title='← Back'
            onPress={handleBack}
            variant='secondary'
            style={styles.backButton}
          />
        </View>

        <View style={styles.profileCard}>
          <ThemedText variant='primary' style={styles.welcomeText}>
            Welcome!
          </ThemedText>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <ThemedText variant='primary' style={styles.label}>
                {i18nService.t("auth.email")}:
              </ThemedText>
              <ThemedText variant='secondary' style={styles.value}>
                {authState.user?.email}
              </ThemedText>
            </View>

            {authState.user?.name && (
              <View style={styles.infoRow}>
                <ThemedText variant='primary' style={styles.label}>
                  {i18nService.t("auth.name")}:
                </ThemedText>
                <ThemedText variant='secondary' style={styles.value}>
                  {authState.user.name}
                </ThemedText>
              </View>
            )}

            <View style={styles.infoRow}>
              <ThemedText variant='primary' style={styles.label}>
                User ID:
              </ThemedText>
              <ThemedText variant='secondary' style={styles.value}>
                {authState.user?.id}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={i18nService.t("auth.logout")}
            onPress={handleLogout}
            variant='danger'
            style={styles.logoutButton}
          />
        </View>

        <View style={styles.status}>
          <ThemedText variant='secondary' style={styles.statusText}>
            Authenticated: {authState.isAuthenticated ? "Yes" : "No"}
          </ThemedText>
          <ThemedText variant='secondary' style={styles.statusText}>
            Language:{" "}
            {i18nService.getCurrentLanguage() === "en"
              ? "English"
              : "Indonesian"}
          </ThemedText>
        </View>
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
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
  },
  profileCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  infoSection: {
    width: "100%",
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
  actions: {
    gap: 16,
    marginBottom: 32,
  },
  logoutButton: {
    marginBottom: 8,
  },
  status: {
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
  },
});
