import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenLayout, SCREEN_BOTTOM_PADDING } from "../../../../shared/components/ScreenLayout/ScreenLayout";
import { useTheme } from "../../../../hooks/use-theme";
import { useThemeStore, type ThemeMode } from "../../../../design-system/theme/themeStore";
import { useAuthStore } from "../../../authentication/store/authStore";
import { biometricService } from "../../../authentication/services/biometricService";

export function SettingsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Fingerprint / Face ID");

  const isBiometricEnabledStore = useAuthStore((state) => state.isBiometricEnabled);
  const setBiometricEnabledStore = useAuthStore((state) => state.setBiometricEnabled);

  useEffect(() => {
    let isMounted = true;
    async function loadBiometrics() {
      const isEnabled = await biometricService.isBiometricEnabled();
      const label = await biometricService.getBiometricTypeLabel();
      if (isMounted) {
        setBiometricEnabled(isEnabled);
        setBiometricLabel(label);
      }
    }
    loadBiometrics();
    return () => {
      isMounted = false;
    };
  }, [isBiometricEnabledStore]);

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const hasHardware = await biometricService.checkHardwareSupport();
      if (!hasHardware) {
        Alert.alert(
          "Not Supported",
          "Biometric authentication isn't supported on this device."
        );
        return;
      }

      const isEnrolled = await biometricService.checkEnrollment();
      if (!isEnrolled) {
        Alert.alert(
          "Not Configured",
          "No fingerprint or Face ID has been configured.\n\nPlease add one in your device settings."
        );
        return;
      }

      const authRes = await biometricService.authenticate(`Confirm ${biometricLabel} to enable`);
      if (authRes.success) {
        await setBiometricEnabledStore(true);
        setBiometricEnabled(true);
      } else if (authRes.error && authRes.error !== "Authentication cancelled") {
        Alert.alert("Authentication Failed", authRes.error);
      }
    } else {
      await setBiometricEnabledStore(false);
      setBiometricEnabled(false);
    }
  };

  const handleChangePasscode = () => {
    const mobile = useAuthStore.getState().mobileNumber || useAuthStore.getState().authenticatedUser?.mobileNumber;
    if (mobile) {
      useAuthStore.getState().setMobileNumber(mobile);
      useAuthStore.getState().setAuthFlowState("FORGOT_PASSCODE_OTP");
      useAuthStore.getState().startForgotPasscode();
      router.push("/(auth)/login" as any);
    } else {
      router.push("/(auth)/login" as any);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your TaxEdge account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            useAuthStore.getState().logout();
            router.replace("/(auth)/login" as any);
          },
        },
      ]
    );
  };

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

        {/* ---------- Preferences Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              PREFERENCES
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
          </View>
        </View>

        {/* ---------- Security Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SECURITY
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}
          >
            {/* Biometric Login */}
            <View style={styles.row}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Biometric Login</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Use {biometricLabel}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>

            {/* Change Passcode */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleChangePasscode}
              style={[
                styles.linkRow,
                { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
              ]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Change Passcode</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Update your 6-digit security PIN
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={[
                styles.linkRow,
                { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
              ]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.error }]}>Logout</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Sign out of your active session
                </Text>
              </View>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
            </TouchableOpacity>
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
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
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
