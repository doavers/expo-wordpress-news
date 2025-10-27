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
      <Stack>
        <Stack.Screen name='index' options={{ title: "Home" }} />
        <Stack.Screen name='about' options={{ title: "About" }} />
        <Stack.Screen name='settings' options={{ title: "Settings" }} />
        <Stack.Screen
          name='profile'
          options={{ title: "Profile", headerBackVisible: false }}
          redirect={!authState.isAuthenticated}
        />
        <Stack.Screen
          name='login'
          options={{ title: "Login", headerBackVisible: false }}
          redirect={authState.isAuthenticated}
        />
        <Stack.Screen
          name='register'
          options={{ title: "Register", headerBackVisible: false }}
          redirect={authState.isAuthenticated}
        />
      </Stack>
    </AppProvider>
  );
}
