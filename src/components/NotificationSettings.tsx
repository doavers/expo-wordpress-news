import React from "react";
import { View, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useTheme } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/providers/NotificationProvider";
import { NotificationPreferences } from "@/types/notifications";

interface NotificationSettingsItemProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export function NotificationSettingsItem({
  title,
  description,
  value,
  onValueChange,
  icon,
  disabled = false,
}: NotificationSettingsItemProps) {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <View style={styles.itemContent}>
        {icon && (
          <View
            style={[styles.iconContainer, { backgroundColor: colors.card }]}
          >
            <Ionicons name={icon} size={20} color={colors.text} />
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {description && (
            <ThemedText
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {description}
            </ThemedText>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.card, true: colors.primary }}
        thumbColor={value ? colors.background : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

interface QuietHoursSettingsProps {
  preferences: NotificationPreferences;
  onPreferencesChange: (updates: Partial<NotificationPreferences>) => void;
}

export function QuietHoursSettings({
  preferences,
  onPreferencesChange,
}: QuietHoursSettingsProps) {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <ThemedView
      style={[styles.section, { backgroundColor: colors.background }]}
    >
      <ThemedText style={styles.sectionTitle}>Quiet Hours</ThemedText>

      <NotificationSettingsItem
        title='Enable Quiet Hours'
        description='Temporarily silence notifications during specific hours'
        value={preferences.quietHours.enabled}
        onValueChange={(enabled) =>
          onPreferencesChange({
            quietHours: { ...preferences.quietHours, enabled },
          })
        }
        icon='moon'
      />

      {preferences.quietHours.enabled && (
        <View style={styles.quietHoursDetails}>
          <View style={[styles.timeRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={styles.timeLabel}>From</ThemedText>
            <TouchableOpacity style={styles.timeButton}>
              <ThemedText style={[styles.timeValue, { color: colors.primary }]}>
                {preferences.quietHours.start}
              </ThemedText>
              <Ionicons
                name='chevron-forward'
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.timeRow}>
            <ThemedText style={styles.timeLabel}>To</ThemedText>
            <TouchableOpacity style={styles.timeButton}>
              <ThemedText style={[styles.timeValue, { color: colors.primary }]}>
                {preferences.quietHours.end}
              </ThemedText>
              <Ionicons
                name='chevron-forward'
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

interface NotificationCategoriesProps {
  preferences: NotificationPreferences;
  onPreferencesChange: (updates: Partial<NotificationPreferences>) => void;
}

export function NotificationCategories({
  preferences,
  onPreferencesChange,
}: NotificationCategoriesProps) {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <ThemedView
      style={[styles.section, { backgroundColor: colors.background }]}
    >
      <ThemedText style={styles.sectionTitle}>Notification Types</ThemedText>

      <NotificationSettingsItem
        title='Breaking News'
        description='Important updates and breaking stories'
        value={preferences.breakingNews}
        onValueChange={(breakingNews) => onPreferencesChange({ breakingNews })}
        icon='flash'
        disabled={!preferences.enabled}
      />

      <NotificationSettingsItem
        title='New Articles'
        description='New articles in your followed categories'
        value={preferences.newArticles}
        onValueChange={(newArticles) => onPreferencesChange({ newArticles })}
        icon='document-text'
        disabled={!preferences.enabled}
      />

      <NotificationSettingsItem
        title='Recommended Content'
        description='Personalized article recommendations'
        value={preferences.recommendedContent}
        onValueChange={(recommendedContent) =>
          onPreferencesChange({ recommendedContent })
        }
        icon='heart'
        disabled={!preferences.enabled}
      />
    </ThemedView>
  );
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onPreferencesChange: (updates: Partial<NotificationPreferences>) => void;
}

export function NotificationPreferencesSection({
  preferences,
  onPreferencesChange,
}: NotificationPreferencesProps) {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <ThemedView
      style={[styles.section, { backgroundColor: colors.background }]}
    >
      <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

      <NotificationSettingsItem
        title='Sound'
        description='Play sound for notifications'
        value={preferences.soundEnabled}
        onValueChange={(soundEnabled) => onPreferencesChange({ soundEnabled })}
        icon='volume-high'
        disabled={!preferences.enabled}
      />

      <NotificationSettingsItem
        title='Vibration'
        description='Vibrate when notifications arrive'
        value={preferences.vibrationEnabled}
        onValueChange={(vibrationEnabled) =>
          onPreferencesChange({ vibrationEnabled })
        }
        icon='phone-portrait'
        disabled={!preferences.enabled}
      />

      <NotificationSettingsItem
        title='App Badge'
        description='Show notification count on app icon'
        value={preferences.badgeEnabled}
        onValueChange={(badgeEnabled) => onPreferencesChange({ badgeEnabled })}
        icon='notifications'
        disabled={!preferences.enabled}
      />
    </ThemedView>
  );
}

interface NotificationPermissionStatusProps {
  onRequestPermissions: () => Promise<boolean>;
}

export function NotificationPermissionStatus({
  onRequestPermissions,
}: NotificationPermissionStatusProps) {
  const { permissionsGranted } = useNotifications();
  const theme = useTheme();
  const colors = theme.colors;

  if (permissionsGranted === null) {
    return (
      <ThemedView
        style={[styles.permissionContainer, { backgroundColor: colors.card }]}
      >
        <Ionicons
          name='notifications-off'
          size={24}
          color={colors.textSecondary}
        />
        <ThemedText style={styles.permissionText}>
          Checking notification permissions...
        </ThemedText>
      </ThemedView>
    );
  }

  if (permissionsGranted) {
    return (
      <ThemedView
        style={[styles.permissionContainer, { backgroundColor: "#d4edda" }]}
      >
        <Ionicons name='checkmark-circle' size={24} color='#155724' />
        <ThemedText style={[styles.permissionText, { color: "#155724" }]}>
          Notifications are enabled
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.permissionContainer, { backgroundColor: "#f8d7da" }]}
    >
      <Ionicons name='notifications-off' size={24} color='#721c24' />
      <View style={styles.permissionContent}>
        <ThemedText style={[styles.permissionText, { color: "#721c24" }]}>
          Notifications are disabled
        </ThemedText>
        <TouchableOpacity
          style={[styles.enableButton, { backgroundColor: "#dc3545" }]}
          onPress={onRequestPermissions}
        >
          <ThemedText style={styles.enableButtonText}>
            Enable Notifications
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

interface PushTokenDisplayProps {
  token: string | null;
}

export function PushTokenDisplay({ token }: PushTokenDisplayProps) {
  const theme = useTheme();
  const colors = theme.colors;

  if (!token) {
    return null;
  }

  return (
    <ThemedView
      style={[styles.tokenContainer, { backgroundColor: colors.card }]}
    >
      <ThemedText style={styles.tokenTitle}>Push Token</ThemedText>
      <ThemedText style={[styles.tokenValue, { color: colors.textSecondary }]}>
        {token.substring(0, 20)}...
      </ThemedText>
      <ThemedText style={[styles.tokenNote, { color: colors.textSecondary }]}>
        This token is used to send notifications to this device
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  quietHoursDetails: {
    marginTop: 8,
    marginLeft: 52,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  timeLabel: {
    fontSize: 16,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  permissionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  permissionContent: {
    alignItems: "center",
    marginTop: 8,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
  enableButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  enableButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  tokenContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 14,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  tokenNote: {
    fontSize: 12,
    lineHeight: 16,
  },
});
