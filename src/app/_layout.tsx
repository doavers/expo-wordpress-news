import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/providers/NotificationProvider";
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
    // Initialize auth state
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  if (authState.isLoading) {
    return null; // Or a loading screen
  }

  // Regular app navigation with all routes
  return (
    <AppProvider>
      <NotificationProvider>
        <StatusBar style='auto' />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='(auth)' options={{ headerShown: false }} />
          <Stack.Screen name='(protected)' options={{ headerShown: false }} />
          <Stack.Screen name='about' options={{ headerShown: false }} />
          <Stack.Screen
            name='notifications'
            options={{
              title: "Notifications",
              headerShown: true,
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </NotificationProvider>
    </AppProvider>
  );
}
