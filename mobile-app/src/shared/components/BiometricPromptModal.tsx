import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../theme";
import { useTheme } from "../../hooks/use-theme";

export interface BiometricPromptModalProps {
  visible: boolean;
  biometricType?: string;
  onEnable: () => void;
  onNotNow: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  visible,
  biometricType = "Biometric",
  onEnable,
  onNotNow,
}) => {
  const colors = useTheme();

  const iconName =
    biometricType.toLowerCase().includes("face")
      ? "scan-outline"
      : "finger-print-outline";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onNotNow}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {/* Top Blue Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: colors.orangeLight }]}>
            <Ionicons name={iconName} size={36} color={colors.orange} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Enable {biometricType} Login?
          </Text>

          {/* Subtitle message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Log in faster and more securely using your device {biometricType.toLowerCase()} next time.
          </Text>

          {/* Enable Button */}
          <TouchableOpacity
            style={[styles.enableBtn, { backgroundColor: colors.primaryDark }]}
            activeOpacity={0.85}
            onPress={onEnable}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.enableBtnText}>Enable</Text>
          </TouchableOpacity>

          {/* Not Now Button */}
          <TouchableOpacity
            style={[styles.notNowBtn, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
            onPress={onNotNow}
          >
            <Text style={[styles.notNowBtnText, { color: colors.textSecondary }]}>
              Not Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  enableBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  enableBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  notNowBtn: {
    width: "100%",
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  notNowBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
});

export default BiometricPromptModal;
