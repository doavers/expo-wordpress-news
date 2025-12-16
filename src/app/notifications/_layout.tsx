import { Stack } from "expo-router";

export default function NotificationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='settings'
        options={{
          title: "Notification Settings",
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name='history'
        options={{
          title: "Notification History",
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
