import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { Button } from "@/components/Button";
import { ThemedTextInput } from "@/components/TextInput";
import { GoogleButton } from "@/components/GoogleButton";
import authService from "@/services/auth";
import googleAuthService from "@/services/googleAuth";
import i18nService from "@/services/i18n";
import { LoginCredentials } from "@/types/auth";

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.login(credentials);
      router.replace("/profile");
    } catch (error) {
      Alert.alert("Error", "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { idToken, userInfo } = await googleAuthService.signInWithGoogle();

      // You would typically send the idToken to your backend for verification
      // For now, we'll create a mock user profile
      const googleAuthResponse = {
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          emailVerified: userInfo.verified_email,
          image: userInfo.picture,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: {
          accessToken: idToken,
          refreshToken: "", // Would come from your backend
        },
      };

      // Store the Google auth result
      await authService.login({
        email: userInfo.email,
        password: "", // Not needed for Google auth
      });

      router.replace("/profile");
    } catch (error) {
      Alert.alert("Error", "Google sign in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText variant='primary' style={styles.title}>
            {i18nService.t("auth.loginTitle")}
          </ThemedText>
        </View>

        <View style={styles.form}>
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
            title={i18nService.t("auth.loginButton")}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>OR</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <GoogleButton
            title='Continue with Google'
            onPress={handleGoogleLogin}
            loading={googleLoading}
            style={styles.googleButton}
          />

          <View style={styles.registerContainer}>
            <ThemedText variant='secondary' style={styles.registerText}>
              {i18nService.t("auth.noAccount")}
            </ThemedText>
            <Button
              title={i18nService.t("auth.register")}
              onPress={handleRegister}
              variant='secondary'
              style={styles.registerButton}
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
  loginButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dadce0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#666666",
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 24,
  },
  registerContainer: {
    alignItems: "center",
    gap: 8,
  },
  registerText: {
    textAlign: "center",
  },
  registerButton: {
    paddingHorizontal: 24,
  },
});
