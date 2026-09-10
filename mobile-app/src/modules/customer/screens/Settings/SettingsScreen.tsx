import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenLayout, SCREEN_BOTTOM_PADDING } from "../../../../shared/components/ScreenLayout/ScreenLayout";
import { useTheme } from "../../../../hooks/use-theme";
import { useThemeStore, type ThemeMode } from "../../../../design-system/theme/themeStore";

export function SettingsScreen() {
  const colors = useTheme();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  const handleSelectTheme = (mode: ThemeMode) => {
    if (mode === theme) return;
    setTheme(mode);
  };

  return (
    <ScreenLayout title="Settings" showBack>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: SCREEN_BOTTOM_PADDING }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Appearance Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="color-palette-outline" size={18} color={colors.orange} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}
          >
            <View style={styles.themeHeaderRow}>
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Choose your preferred application appearance
                </Text>
              </View>
            </View>

            {/* Modern Segmented Control */}
            <View
              style={[
                styles.segmentedContainer,
                {
                  backgroundColor: theme === "dark" ? "#0F172A" : "#F1F5F9",
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Light Option */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectTheme("light")}
                style={[
                  styles.segmentOption,
                  theme === "light" && [
                    styles.segmentOptionActive,
                    {
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      shadowColor: "#083B75",
                    },
                  ],
                ]}
                accessibilityRole="button"
                accessibilityLabel="Light theme"
                accessibilityState={{ selected: theme === "light" }}
              >
                <View style={styles.segmentContent}>
                  <Ionicons
                    name={theme === "light" ? "sunny" : "sunny-outline"}
                    size={19}
                    color={theme === "light" ? "#FF7A00" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: theme === "light" ? "#083B75" : colors.textSecondary,
                        fontWeight: theme === "light" ? "700" : "500",
                      },
                    ]}
                  >
                    Light
                  </Text>
                </View>
                {theme === "light" && (
                  <View style={[styles.activeDot, { backgroundColor: "#FF7A00" }]} />
                )}
              </TouchableOpacity>

              {/* Dark Option */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectTheme("dark")}
                style={[
                  styles.segmentOption,
                  theme === "dark" && [
                    styles.segmentOptionActive,
                    {
                      backgroundColor: "#1E293B",
                      borderColor: "#334155",
                      shadowColor: "#000000",
                    },
                  ],
                ]}
                accessibilityRole="button"
                accessibilityLabel="Dark theme"
                accessibilityState={{ selected: theme === "dark" }}
              >
                <View style={styles.segmentContent}>
                  <Ionicons
                    name={theme === "dark" ? "moon" : "moon-outline"}
                    size={18}
                    color={theme === "dark" ? "#38BDF8" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: theme === "dark" ? "#F8FAFC" : colors.textSecondary,
                        fontWeight: theme === "dark" ? "700" : "500",
                      },
                    ]}
                  >
                    Dark
                  </Text>
                </View>
                {theme === "dark" && (
                  <View style={[styles.activeDot, { backgroundColor: "#38BDF8" }]} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.themeInfoFooter}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.themeInfoText, { color: colors.textSecondary }]}>
                {theme === "light"
                  ? "Standard clean finance interface optimized for day use."
                  : "Sleek low-light interface optimized for night and OLED screens."}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Preferences & Security ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              PREFERENCES & SECURITY
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Filing alerts and deadline reminders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
              ]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Biometric Authentication
                </Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Fingerprint or Face ID for fast login
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>
          </View>
        </View>

        {/* ---------- App Information ---------- */}
        <View style={styles.appInfoContainer}>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            TaxEdge Fin Solutions • v1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  themeHeaderRow: {
    marginBottom: 14,
  },
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    gap: 6,
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    position: "relative",
  },
  segmentOptionActive: {
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  segmentText: {
    fontSize: 14,
  },
  activeDot: {
    position: "absolute",
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  themeInfoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  themeInfoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchLabelGroup: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  appInfoContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default SettingsScreen;
