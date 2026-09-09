import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../shared/hooks/useTheme";
import { BrandColors } from "../../../shared/theme";

export interface ComplianceHeaderProps {
  onBackPress?: () => void;
  showProgressLine?: boolean;
}

export const ComplianceHeader: React.FC<ComplianceHeaderProps> = ({
  onBackPress,
  showProgressLine = true,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#F8FAFC" : "#0F172A"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.titleText,
            { color: isDark ? "#F8FAFC" : "#0F172A" },
          ]}
        >
          GST Compliance
        </Text>

        <View style={styles.placeholderBox} />
      </View>

      {/* Thin Fintech Orange Progress Line */}
      {showProgressLine && (
        <View style={styles.progressLineTrack}>
          <View
            style={[
              styles.progressLineBar,
              { backgroundColor: BrandColors.PRIMARY_ORANGE },
            ]}
          />
        </View>
      )}

      {/* Information Card */}
      <View style={styles.cardWrapper}>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.infoIconBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={BrandColors.PRIMARY_BLUE_ACCENT}
            />
          </View>
          <Text
            style={[
              styles.infoText,
              { color: isDark ? "#CBD5E1" : "#475569" },
            ]}
          >
            Need help with GST compliance? Select your request type and upload the
            required documents. Our CA team will review and contact you.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  placeholderBox: {
    width: 38,
  },
  progressLineTrack: {
    height: 3,
    width: "100%",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  progressLineBar: {
    height: "100%",
    width: "100%",
  },
  cardWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  infoIconBox: {
    paddingTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18.5,
    fontWeight: "500",
  },
});
