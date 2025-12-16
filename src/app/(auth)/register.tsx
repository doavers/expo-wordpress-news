import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { Button } from "@/components/Button";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import authService from "@/services/auth";
import i18nService from "@/services/i18n";
import { RegisterCredentials } from "@/types/auth";

export default function RegisterPage() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterCredentials> = {};

    if (!credentials.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!credentials.name) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.register(credentials);
      router.replace("/profile");
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSkipToHome = () => {
    router.replace("/");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.title}>
            {i18nService.t("auth.registerTitle")}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <ThemedTextInput
            label={i18nService.t("auth.name")}
            value={credentials.name}
            onChangeText={(text) =>
              setCredentials((prev) => ({ ...prev, name: text }))
            }
            error={errors.name}
          />

          <ThemedTextInput
            label={i18nService.t("auth.email")}
            value={credentials.email}
            onChangeText={(text) =>
              setCredentials((prev) => ({ ...prev, email: text }))
            }
            keyboardType='email-address'
            autoCapitalize='none'
            error={errors.email}
          />

          <ThemedTextInput
            label={i18nService.t("auth.password")}
            value={credentials.password}
            onChangeText={(text) =>
              setCredentials((prev) => ({ ...prev, password: text }))
            }
            secureTextEntry
            error={errors.password}
          />

          <Button
            title={i18nService.t("auth.registerButton")}
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <ThemedText variant='secondary' style={styles.loginText}>
              {i18nService.t("auth.haveAccount")}
            </ThemedText>
            <Button
              title={i18nService.t("auth.login")}
              onPress={handleLogin}
              variant='secondary'
              style={styles.loginButton}
            />
          </View>

          <View style={styles.skipContainer}>
            <Button
              title={i18nService.t("auth.skipToHome")}
              onPress={handleSkipToHome}
              variant='outline'
              style={styles.skipButton}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  form: {
    width: "100%",
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    alignItems: "center",
    gap: 8,
  },
  loginText: {
    textAlign: "center",
  },
  loginButton: {
    paddingHorizontal: 24,
  },
  skipContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  skipButton: {
    paddingHorizontal: 32,
  },
});
