import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../theme";
import { useAuthStore } from "../../modules/authentication/store/authStore";

export interface CompleteProfileModalProps {
  visible?: boolean;
  onCancel?: () => void;
  onCompleteProfile?: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  visible: propVisible,
  onCancel: propOnCancel,
  onCompleteProfile: propOnCompleteProfile,
}) => {
  const router = useRouter();
  const storeVisible = useAuthStore((s) => s.isCompleteProfileModalOpen);
  const closeCompleteProfileModal = useAuthStore((s) => s.closeCompleteProfileModal);

  const isVisible = propVisible !== undefined ? propVisible : storeVisible;

  const handleCancel = () => {
    if (propOnCancel) {
      propOnCancel();
    } else {
      closeCompleteProfileModal();
    }
  };

  const handleCompleteProfile = () => {
    if (propOnCompleteProfile) {
      propOnCompleteProfile();
    } else {
      closeCompleteProfileModal();
      router.push("/(auth)/createprofile" as any);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Blue/Orange Icon Badge */}
          <View style={styles.iconCircle}>
            <Ionicons name="person-circle-outline" size={32} color={BrandColors.PRIMARY_BLUE} />
          </View>

          {/* Heading & Subtitle */}
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.message}>
            Please complete your profile to access TaxEdge services.
          </Text>

          {/* Primary Button: Complete Profile */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleCompleteProfile}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Complete Profile</Text>
          </TouchableOpacity>

          {/* Secondary Button: Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={handleCancel}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E7EDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  message: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  primaryBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    shadowColor: BrandColors.PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  cancelBtn: {
    width: "100%",
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
});

export default CompleteProfileModal;
