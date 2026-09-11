import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { apiClient, getDefaultBaseUrl } from "../../core/api/apiClient";
import { BrandColors, Typography, BorderRadius, Spacing } from "../theme";

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState(apiClient.getBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setUrl(apiClient.getBaseUrl());
      setTestResult(null);
    }
  }, [visible]);

  const handleTest = async () => {
    let target = url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `http://${target}`;
    }
    if (target.endsWith("/")) {
      target = target.slice(0, -1);
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${target}/actuator/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok || res.status === 200 || res.status === 401 || res.status === 403) {
        setTestResult({ success: true, message: "Backend is reachable!" });
      } else {
        setTestResult({ success: false, message: `Server returned status ${res.status}` });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "Cannot reach server. Verify IP and Wi-Fi connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    let clean = url.trim();
    if (!clean) {
      Alert.alert("Invalid URL", "Please enter a valid IP address or server URL.");
      return;
    }
    const saved = await apiClient.saveCustomBaseUrl(clean);
    Alert.alert("Server Configured", `Backend URL updated to:\n${saved}`);
    onSaved?.(saved);
    onClose();
  };

  const handleReset = async () => {
    const def = await apiClient.resetCustomBaseUrl();
    setUrl(def);
    setTestResult(null);
    Alert.alert("Reset Complete", `Restored default backend URL:\n${def}`);
    onSaved?.(def);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="server-outline" size={24} color={BrandColors.PRIMARY_BLUE} />
            <Text style={styles.title}>Backend Server IP</Text>
          </View>

          <Text style={styles.description}>
            Configure the backend IP or tunnel URL (e.g. Wi-Fi IP or ngrok) for this device:
          </Text>

          {/* Input */}
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={(txt) => {
              setUrl(txt);
              setTestResult(null);
            }}
            placeholder="http://192.168.88.49:8088"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {/* Test Status */}
          {testResult && (
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: testResult.success ? "#ECFDF5" : "#FEF2F2" },
              ]}
            >
              <Ionicons
                name={testResult.success ? "checkmark-circle" : "close-circle"}
                size={16}
                color={testResult.success ? "#10B981" : "#EF4444"}
              />
              <Text
                style={[
                  styles.resultText,
                  { color: testResult.success ? "#065F46" : "#991B1B" },
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          {/* Test Button */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTest}
            disabled={isTesting}
            activeOpacity={0.7}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color={BrandColors.PRIMARY_BLUE} />
            ) : (
              <Text style={styles.testBtnText}>Test Connection</Text>
            )}
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset Default</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save & Connect</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  description: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: "#64748B",
    marginBottom: Spacing.base,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    fontSize: Typography.fontSize.base,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: Spacing.sm,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  resultText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  testBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#EFF6FF",
    marginBottom: Spacing.base,
  },
  testBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: "#64748B",
  },
  saveBtn: {
    flex: 1.3,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.WHITE,
  },
  closeBtn: {
    marginTop: Spacing.base,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: Typography.fontSize.sm,
    color: "#94A3B8",
  },
});
