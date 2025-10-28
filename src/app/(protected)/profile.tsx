import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, ThemedView } from "@/components";
import { Button } from "@/components/Button";
import authService from "@/services/auth";
import i18nService from "@/services/i18n";
import { AuthState } from "@/types/auth";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleCopyUserId = (userId: string) => {
    // Show the full ID in an alert for manual copying
    Alert.alert(
      "User ID",
      `Full User ID: ${userId}\n\nYou can copy this manually.`,
      [{ text: "OK" }]
    );
  };

  const formatUserId = (userId: string) => {
    if (!userId || userId.length <= 12) return userId;
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
  };

  if (!authState.isAuthenticated) {
    return null; // This should be handled by the router redirect
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name='arrow-back' size={24} color='#007AFF' />
            </TouchableOpacity>
            <ThemedText variant='primary' style={styles.title}>
              {i18nService.t("profile.title")}
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.profileCard}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <Image
                source={
                  authState.user?.image
                    ? { uri: authState.user.image }
                    : require("../../../assets/default-avatar.jpg")
                }
                style={styles.avatar}
                contentFit='cover'
              />
              <View style={styles.avatarInfo}>
                <ThemedText variant='primary' style={styles.userName}>
                  {authState.user?.name || "User"}
                </ThemedText>
                <ThemedText variant='secondary' style={styles.userEmail}>
                  {authState.user?.email}
                </ThemedText>
              </View>
            </View>

            {/* User Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailItem}>
                <ThemedText variant='primary' style={styles.detailLabel}>
                  User ID:
                </ThemedText>
                <View style={styles.detailValueWithCopy}>
                  <ThemedText variant='secondary' style={styles.detailValue}>
                    {formatUserId(authState.user?.id || "")}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopyUserId(authState.user?.id || "")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name='copy-outline' size={16} color='#007AFF' />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailItem}>
                <ThemedText variant='primary' style={styles.detailLabel}>
                  Member Since:
                </ThemedText>
                <ThemedText variant='secondary' style={styles.detailValue}>
                  {authState.user?.createdAt
                    ? new Date(authState.user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </ThemedText>
              </View>

              {authState.user?.emailVerified !== undefined && (
                <View style={styles.detailItem}>
                  <ThemedText variant='primary' style={styles.detailLabel}>
                    Email Status:
                  </ThemedText>
                  <ThemedText
                    variant='secondary'
                    style={[
                      styles.detailValue,
                      {
                        color: authState.user.emailVerified
                          ? "#34C759"
                          : "#FF9500",
                      },
                    ]}
                  >
                    {authState.user.emailVerified ? "Verified" : "Not Verified"}
                  </ThemedText>
                </View>
              )}
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

          <View style={styles.statusSection}>
            <View style={styles.statusItem}>
              <ThemedText variant='primary' style={styles.statusLabel}>
                Account Status
              </ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: authState.isAuthenticated
                      ? "#34C759"
                      : "#FF9500",
                  },
                ]}
              >
                <ThemedText style={styles.statusText}>
                  {authState.isAuthenticated ? "Active" : "Inactive"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.statusItem}>
              <ThemedText variant='primary' style={styles.statusLabel}>
                App Language
              </ThemedText>
              <View style={styles.languageBadge}>
                <ThemedText style={styles.statusText}>
                  {i18nService.getCurrentLanguage() === "en"
                    ? "English"
                    : "Indonesian"}
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,122,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 16,
  },
  profileCard: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  detailsSection: {
    padding: 24,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
    opacity: 0.8,
    flex: 1,
  },
  detailValueWithCopy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    gap: 8,
  },
  copyButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0,122,255,0.1)",
  },
  actions: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  logoutButton: {
    marginBottom: 8,
  },
  statusSection: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#007AFF",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
