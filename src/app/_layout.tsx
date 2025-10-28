import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import authService from "@/services/auth";
import { AuthState } from "@/types/auth";

export default function RootLayout() {
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

  if (authState.isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AppProvider>
      <StatusBar style='auto' />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
      </Stack>
    </AppProvider>
  );
}
