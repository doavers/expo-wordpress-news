import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useTheme } from "@/contexts/AppContext";
import { Ionicons } from "@expo/vector-icons";

interface TimePickerProps {
  visible: boolean;
  value: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
  title?: string;
}

interface TimeItem {
  value: string;
  label: string;
}

export function TimePicker({
  visible,
  value,
  onConfirm,
  onCancel,
  title = "Select Time",
}: TimePickerProps) {
  const theme = useTheme();
  const colors = theme.colors;

  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Parse current value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    }
  }, [value]);

  // Generate hour options (0-23)
  const hours: TimeItem[] = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label:
      i === 0
        ? "12 AM"
        : i < 12
        ? `${i} AM`
        : i === 12
        ? "12 PM"
        : `${i - 12} PM`,
  }));

  // Generate minute options (0, 15, 30, 45)
  const minutes: TimeItem[] = [
    { value: "00", label: "00" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
  ];

  const handleConfirm = () => {
    const timeString = `${selectedHour
      .toString()
      .padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
    onConfirm(timeString);
  };

  const renderTimeItem = ({ item }: { item: TimeItem }) => (
    <TouchableOpacity
      style={[
        styles.timeItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => {
        if (hours.includes(item)) {
          setSelectedHour(parseInt(item.value));
        } else {
          setSelectedMinute(parseInt(item.value));
        }
      }}
    >
      <ThemedText
        style={[
          styles.timeItemText,
          {
            color: colors.text,
            fontWeight:
              (hours.includes(item) && parseInt(item.value) === selectedHour) ||
              (!hours.includes(item) && parseInt(item.value) === selectedMinute)
                ? "600"
                : "400",
          },
        ]}
      >
        {item.label}
      </ThemedText>
    </TouchableOpacity>
  );

  const currentTimeString = `${selectedHour
    .toString()
    .padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='slide'
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <ThemedView
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {title}
            </ThemedText>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name='close' size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Current Selection */}
          <View
            style={[
              styles.currentSelection,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
              },
            ]}
          >
            <ThemedText style={[styles.currentTime, { color: colors.primary }]}>
              {currentTimeString}
            </ThemedText>
          </View>

          {/* Time Pickers */}
          <View style={styles.pickersContainer}>
            {/* Hours */}
            <View style={styles.pickerColumn}>
              <ThemedText
                style={[styles.pickerLabel, { color: colors.textSecondary }]}
              >
                Hour
              </ThemedText>
              <View
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <FlatList
                  data={hours}
                  renderItem={renderTimeItem}
                  keyExtractor={(item) => `hour-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.list}
                  initialScrollIndex={selectedHour}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                />
              </View>
            </View>

            {/* Separator */}
            <ThemedText style={[styles.separator, { color: colors.text }]}>
              :
            </ThemedText>

            {/* Minutes */}
            <View style={styles.pickerColumn}>
              <ThemedText
                style={[styles.pickerLabel, { color: colors.textSecondary }]}
              >
                Minute
              </ThemedText>
              <View
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <FlatList
                  data={minutes}
                  renderItem={renderTimeItem}
                  keyExtractor={(item) => `minute-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.list}
                  initialScrollIndex={minutes.findIndex(
                    (m) => parseInt(m.value) === selectedMinute
                  )}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: colors.border },
              ]}
              onPress={onCancel}
            >
              <ThemedText style={[styles.buttonText, { color: colors.text }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleConfirm}
            >
              <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

// Simple inline time picker component
interface SimpleTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function SimpleTimePicker({
  value,
  onChange,
  disabled = false,
}: SimpleTimePickerProps) {
  const theme = useTheme();
  const colors = theme.colors;

  const [showPicker, setShowPicker] = useState(false);

  const formatTimeDisplay = (time: string) => {
    if (!time) return "Select time";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.simplePicker,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <ThemedText style={[styles.simplePickerText, { color: colors.text }]}>
          {formatTimeDisplay(value)}
        </ThemedText>
        <Ionicons name='chevron-down' size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <TimePicker
        visible={showPicker}
        value={value}
        onConfirm={(time) => {
          onChange(time);
          setShowPicker(false);
        }}
        onCancel={() => setShowPicker(false)}
      />
    </View>
  );
}

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  currentSelection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 20,
  },
  currentTime: {
    fontSize: 24,
    fontWeight: "600",
  },
  pickersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  picker: {
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
  },
  list: {
    flex: 1,
  },
  timeItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  timeItemText: {
    fontSize: 16,
  },
  separator: {
    fontSize: 24,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  simplePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  simplePickerText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
