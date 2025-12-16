import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useTheme } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { NotificationFrequency } from "@/types/notifications";
import { NOTIFICATION_FREQUENCIES } from "@/constants/notifications";

interface NotificationFrequencyProps {
  value: NotificationFrequency;
  onChange: (frequency: NotificationFrequency) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

interface FrequencyOption {
  value: NotificationFrequency;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function NotificationFrequencyControl({
  value,
  onChange,
  disabled = false,
  title = "Notification Frequency",
  description = "How often would you like to receive notifications?",
}: NotificationFrequencyProps) {
  const theme = useTheme();
  const colors = theme.colors;

  const frequencyOptions: FrequencyOption[] = [
    {
      value: NOTIFICATION_FREQUENCIES.REALTIME,
      label: "Real-time",
      description: "Get notifications instantly as they happen",
      icon: "flash",
    },
    {
      value: NOTIFICATION_FREQUENCIES.HOURLY,
      label: "Hourly",
      description: "Receive notifications bundled every hour",
      icon: "time",
    },
    {
      value: NOTIFICATION_FREQUENCIES.DAILY,
      label: "Daily",
      description: "Get a daily digest of notifications",
      icon: "calendar",
    },
    {
      value: NOTIFICATION_FREQUENCIES.WEEKLY,
      label: "Weekly",
      description: "Receive a weekly summary of notifications",
      icon: "calendar-outline",
    },
    {
      value: NOTIFICATION_FREQUENCIES.NEVER,
      label: "Never",
      description: "Turn off these notifications",
      icon: "notifications-off",
    },
  ];

  const handleFrequencyChange = (frequency: NotificationFrequency) => {
    if (!disabled) {
      onChange(frequency);
    }
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          {title}
        </ThemedText>
        {description && (
          <ThemedText
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {description}
          </ThemedText>
        )}
      </View>

      {/* Frequency Options */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {frequencyOptions.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  opacity: isDisabled ? 0.5 : 1,
                },
              ]}
              onPress={() => handleFrequencyChange(option.value)}
              disabled={isDisabled}
            >
              <View style={styles.optionContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isSelected
                        ? "rgba(255, 255, 255, 0.2)"
                        : colors.card,
                    },
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={isSelected ? "white" : colors.primary}
                  />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? "white" : colors.text,
                        fontWeight: isSelected ? "600" : "500",
                      },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.optionDescription,
                      {
                        color: isSelected
                          ? "rgba(255, 255, 255, 0.8)"
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {option.description}
                  </ThemedText>
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                  <View style={styles.selectionIndicator}>
                    <Ionicons name='checkmark' size={16} color='white' />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

// Compact frequency selector for inline use
interface CompactFrequencyProps {
  value: NotificationFrequency;
  onChange: (frequency: NotificationFrequency) => void;
  disabled?: boolean;
}

export function CompactFrequencySelector({
  value,
  onChange,
  disabled = false,
}: CompactFrequencyProps) {
  const theme = useTheme();
  const colors = theme.colors;

  const options = [
    NOTIFICATION_FREQUENCIES.REALTIME,
    NOTIFICATION_FREQUENCIES.HOURLY,
    NOTIFICATION_FREQUENCIES.DAILY,
    NOTIFICATION_FREQUENCIES.WEEKLY,
  ];

  const getFrequencyLabel = (frequency: NotificationFrequency) => {
    switch (frequency) {
      case NOTIFICATION_FREQUENCIES.REALTIME:
        return "Real-time";
      case NOTIFICATION_FREQUENCIES.HOURLY:
        return "Hourly";
      case NOTIFICATION_FREQUENCIES.DAILY:
        return "Daily";
      case NOTIFICATION_FREQUENCIES.WEEKLY:
        return "Weekly";
      case NOTIFICATION_FREQUENCIES.NEVER:
        return "Never";
      default:
        return frequency;
    }
  };

  return (
    <View
      style={[
        styles.compactContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {options.map((option, index) => {
        const isSelected = value === option;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.compactOption,
              {
                borderRightColor: isLast ? "transparent" : colors.border,
                backgroundColor: isSelected ? colors.primary : "transparent",
              },
            ]}
            onPress={() => !disabled && onChange(option)}
            disabled={disabled}
          >
            <ThemedText
              style={[
                styles.compactOptionText,
                {
                  color: isSelected ? "white" : colors.text,
                  fontWeight: isSelected ? "600" : "400",
                },
              ]}
            >
              {getFrequencyLabel(option)}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  optionContent: {
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
  optionLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  compactContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  compactOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRightWidth: 1,
  },
  compactOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
