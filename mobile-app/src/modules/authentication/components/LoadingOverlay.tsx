import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../shared/theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = "Please wait..." }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(12, 35, 64, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  message: {
    marginTop: 14,
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#0C2340",
    textAlign: "center",
  },
});

export default LoadingOverlay;
