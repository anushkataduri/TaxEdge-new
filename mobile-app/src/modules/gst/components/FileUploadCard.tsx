import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../../shared/hooks/useTheme";
import { BrandColors } from "../../../shared/theme";
import {
  formatFileSize,
  isFileSizeValid,
  isFileTypeAllowed,
  MAX_FILE_SIZE_BYTES,
} from "../utils/gstValidation";
import { UploadedDocInfo } from "../validation/complianceSchema";

export interface FileUploadCardProps {
  title: string;
  description?: string; // Ignored for minimal UI
  required?: boolean;
  allowedExtensions: string[];
  supportedFormatsText?: string;
  maxSizeBytes?: number;
  uploadedDoc: UploadedDocInfo | null;
  onDocChange: (doc: UploadedDocInfo | null) => void;
  error?: string;
  onClearError?: () => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  title,
  required = false,
  allowedExtensions,
  supportedFormatsText = "PDF, JPG, PNG, XLS, XLSX, CSV",
  maxSizeBytes = MAX_FILE_SIZE_BYTES,
  uploadedDoc,
  onDocChange,
  error,
  onClearError,
}) => {
  const { isDark } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getMimeTypes = (): string[] => {
    const mimes: string[] = [];
    if (allowedExtensions.includes(".pdf")) mimes.push("application/pdf");
    if (
      allowedExtensions.includes(".xls") ||
      allowedExtensions.includes(".xlsx")
    ) {
      mimes.push("application/vnd.ms-excel");
      mimes.push(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    }
    if (allowedExtensions.includes(".csv")) {
      mimes.push("text/csv");
      mimes.push("application/csv");
      mimes.push("text/comma-separated-values");
    }
    if (
      allowedExtensions.includes(".jpg") ||
      allowedExtensions.includes(".png") ||
      allowedExtensions.includes(".jpeg")
    ) {
      mimes.push("image/*");
    }
    return mimes.length > 0 ? mimes : ["*/*"];
  };

  const simulateProgress = (callback: () => void) => {
    setIsUploading(true);
    setUploadProgress(20);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(100);
            callback();
          }, 100);
          return 95;
        }
        return prev + 30;
      });
    }, 70);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: getMimeTypes(),
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name || `${title.replace(/\s+/g, "_")}.pdf`;
        const fileSize = asset.size;

        // Silent validation
        if (!isFileTypeAllowed(fileName, allowedExtensions)) {
          Alert.alert(
            "Unsupported File",
            `Please upload a valid file (${supportedFormatsText}).\nMaximum size: 20 MB.`
          );
          return;
        }

        if (!isFileSizeValid(fileSize, maxSizeBytes)) {
          Alert.alert(
            "File Too Large",
            "Maximum size allowed is 20 MB. Please select a smaller file."
          );
          return;
        }

        simulateProgress(() => {
          onDocChange({
            uri: asset.uri,
            name: fileName,
            size: fileSize,
            sizeFormatted: formatFileSize(fileSize),
            mimeType: asset.mimeType,
          });
          if (onClearError) onClearError();
        });
      }
    } catch (err) {
      Alert.alert("Upload Error", "Could not select file. Please try again.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is required to take photos of your document."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const cleanName = `${title.replace(/\s+/g, "_")}_Capture.jpg`;
        const fileSize = asset.fileSize;

        // Silent validation
        if (!isFileSizeValid(fileSize, maxSizeBytes)) {
          Alert.alert(
            "File Too Large",
            "Captured photo exceeds 20 MB limit. Please take with standard resolution."
          );
          return;
        }

        simulateProgress(() => {
          onDocChange({
            uri: asset.uri,
            name: cleanName,
            size: fileSize,
            sizeFormatted: formatFileSize(fileSize || 1500000),
            mimeType: "image/jpeg",
          });
          if (onClearError) onClearError();
        });
      }
    } catch (err) {
      Alert.alert("Camera Error", "Could not capture photo. Please try again.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Remove Document?",
      `Are you sure you want to remove "${uploadedDoc?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDocChange(null);
          },
        },
      ]
    );
  };

  const getDocIcon = (filename: string): keyof typeof Ionicons.glyphMap => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) return "document-text";
    if (
      lower.endsWith(".xls") ||
      lower.endsWith(".xlsx") ||
      lower.endsWith(".csv")
    ) {
      return "grid-outline";
    }
    if (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png")
    ) {
      return "image-outline";
    }
    return "document-outline";
  };

  return (
    <View
      style={[
        styles.cardContainer,
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
      {/* Uploading State */}
      {isUploading ? (
        <View style={styles.uploadingBox}>
          <View style={styles.uploadingHeader}>
            <Text
              style={[
                styles.uploadingText,
                { color: isDark ? "#F8FAFC" : "#0F172A" },
              ]}
            >
              Uploading Document...
            </Text>
            <Text
              style={[
                styles.uploadingPercent,
                { color: BrandColors.PRIMARY_ORANGE },
              ]}
            >
              {uploadProgress}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${uploadProgress}%` },
              ]}
            />
          </View>
        </View>
      ) : uploadedDoc ? (
        /* Minimal Uploaded State */
        <View style={styles.contentContainer}>
          {/* Top Row: Icon + Filename + ✓ Uploaded Badge */}
          <View style={styles.topRow}>
            <View style={styles.titleWithIcon}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isDark ? "#0F172A" : "#EAF1FE" },
                ]}
              >
                <Ionicons
                  name={getDocIcon(uploadedDoc.name)}
                  size={20}
                  color={BrandColors.PRIMARY_BLUE_ACCENT}
                />
              </View>
              <Text
                style={[
                  styles.fileNameText,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {uploadedDoc.name}
              </Text>
            </View>

            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
              <Text style={styles.successBadgeText}>Uploaded</Text>
            </View>
          </View>

          {/* File Size */}
          <Text
            style={[
              styles.fileSizeText,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            {uploadedDoc.sizeFormatted}
          </Text>

          {/* Action Buttons: Replace & Delete */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickFile}
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? "#334155" : "#FFFFFF",
                  borderColor: isDark ? "#475569" : "#CBD5E1",
                },
              ]}
            >
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={isDark ? "#E2E8F0" : "#334155"}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? "#E2E8F0" : "#334155" },
                ]}
              >
                Replace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDelete}
              style={[
                styles.secondaryButton,
                styles.deleteButton,
                {
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.1)"
                    : "#FEE2E2",
                  borderColor: isDark ? "#7F1D1D" : "#FECACA",
                },
              ]}
            >
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={[styles.secondaryButtonText, { color: "#DC2626" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Minimal Empty State */
        <View style={styles.contentContainer}>
          {/* Top Row: Icon + Title + Required Badge */}
          <View style={styles.topRow}>
            <View style={styles.titleWithIcon}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color={BrandColors.PRIMARY_BLUE_ACCENT}
              />
              <Text
                style={[
                  styles.titleText,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                {title}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: required
                    ? isDark
                      ? "rgba(239, 68, 68, 0.15)"
                      : "#FEE2E2"
                    : isDark
                    ? "rgba(100, 116, 139, 0.2)"
                    : "#F1F5F9",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: required ? "#DC2626" : isDark ? "#94A3B8" : "#64748B",
                  },
                ]}
              >
                {required ? "Required" : "Optional"}
              </Text>
            </View>
          </View>

          {/* Two Action Buttons: [ 📷 Camera ]  [ ☁ Upload File ] */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleTakePhoto}
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? "#334155" : "#FFFFFF",
                  borderColor: isDark ? "#475569" : "#CBD5E1",
                },
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={isDark ? "#F8FAFC" : "#1E293B"}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? "#F8FAFC" : "#1E293B" },
                ]}
              >
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickFile}
              style={styles.primaryButton}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Inline Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contentContainer: {
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  fileNameText: {
    fontSize: 14.5,
    fontWeight: "600",
    flex: 1,
  },
  fileSizeText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: -4,
    marginLeft: 40,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F5F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  secondaryButtonText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  deleteButton: {
    borderWidth: 1,
  },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  uploadingBox: {
    paddingVertical: 8,
    gap: 8,
  },
  uploadingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadingText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  uploadingPercent: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
});
