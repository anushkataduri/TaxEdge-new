import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "../../../shared/hooks/useTheme";
import { BrandColors } from "../../../shared/theme";

export interface NativeDatePickerInputProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDateToString(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

function parseStringToDate(str?: string): Date {
  if (!str) return new Date();
  const parts = str.trim().split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export const NativeDatePickerInput: React.FC<NativeDatePickerInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder = "Select Date",
}) => {
  const { isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const currentDate = parseStringToDate(value);

  const handleNativeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selectedDate) {
      onChange(formatDateToString(selectedDate));
    }
  };

  // For Web platform
  if (Platform.OS === "web") {
    const formatForWebInput = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const handleWebChange = (e: any) => {
      const val = e.target.value;
      if (val) {
        const [y, m, d] = val.split("-").map(Number);
        const newDate = new Date(y, m - 1, d);
        onChange(formatDateToString(newDate));
      }
    };

    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.label,
            { color: isDark ? "#E2E8F0" : "#334155" },
          ]}
        >
          {label} {required && <Text style={styles.star}>*</Text>}
        </Text>
        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: error
                ? "#EF4444"
                : isDark
                ? "#334155"
                : "#E2E8F0",
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={isDark ? "#94A3B8" : "#64748B"}
          />
          {/* @ts-ignore - Web native date input */}
          <input
            type="date"
            defaultValue={value ? formatForWebInput(currentDate) : ""}
            onChange={handleWebChange}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: "15px",
              fontFamily: "inherit",
              paddingLeft: "8px",
            }}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isDark ? "#E2E8F0" : "#334155" },
        ]}
      >
        {label} {required && <Text style={styles.star}>*</Text>}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowPicker(true)}
        style={[
          styles.inputBox,
          {
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderColor: error
              ? "#EF4444"
              : isDark
              ? "#334155"
              : "#E2E8F0",
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={isDark ? "#94A3B8" : "#64748B"}
        />
        <Text
          style={[
            styles.valueText,
            {
              color: value
                ? isDark
                  ? "#F8FAFC"
                  : "#0F172A"
                : isDark
                ? "#64748B"
                : "#94A3B8",
            },
          ]}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleNativeChange}
          themeVariant={isDark ? "dark" : "light"}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  star: {
    color: "#EF4444",
  },
  inputBox: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  valueText: {
    fontSize: 14.5,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
    fontWeight: "500",
  },
});
