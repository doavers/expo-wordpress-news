import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ThemedText, ThemedView } from "@/components";
import i18nService from "@/services/i18n";

export default function AboutPage() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.title}>
            {i18nService.t("about.title")}
          </ThemedText>
        </View>

        <View style={styles.body}>
          <ThemedText variant='secondary' style={styles.description}>
            {i18nService.t("about.description")}
          </ThemedText>

          <View style={styles.features}>
            <ThemedText variant='primary' style={styles.featureTitle}>
              Features:
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • Authentication with login/register
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • Internationalization (English/Indonesian)
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • Theme support (light/dark/system)
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • File-based routing with Expo Router
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • TypeScript support with strict mode
            </ThemedText>
          </View>

          <View style={styles.tech}>
            <ThemedText variant='primary' style={styles.featureTitle}>
              Technology Stack:
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • Expo SDK ~54.0.20
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • Expo Router
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • React Native 0.81.5
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • React 19.1.0
            </ThemedText>
            <ThemedText variant='secondary' style={styles.featureItem}>
              • TypeScript 5.9.2
            </ThemedText>
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
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  features: {
    marginBottom: 30,
  },
  tech: {
    marginBottom: 30,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  featureItem: {
    lineHeight: 22,
    marginBottom: 4,
  },
});
