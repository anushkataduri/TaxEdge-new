import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../shared/theme";
import { GstBusinessFormData } from "./GstBusinessStep";
import { DocumentItem } from "./GstUnifiedDocumentStep";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface GstReviewStepProps {
  businessData: GstBusinessFormData;
  documents: DocumentItem[];
  onEditStep: (stepIndex: number) => void;
  declared: boolean;
  onToggleDeclaration: () => void;
}

export const GstReviewStep: React.FC<GstReviewStepProps> = ({
  businessData,
  documents,
  onEditStep,
  declared,
  onToggleDeclaration,
}) => {
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const uploadedDocs = documents.filter((d) => Boolean(d.fileUri));
  const uploadedCount = uploadedDocs.length;
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* 1. Business Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Business Details</Text>
          <TouchableOpacity onPress={() => onEditStep(0)} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Business / Trade Name</Text>
          <Text style={styles.value}>
            {businessData.businessName || "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Business Type</Text>
          <Text style={styles.value}>{businessData.businessType || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nature of Business</Text>
          <Text style={styles.value}>{businessData.natureOfBusiness || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Business Address</Text>
          <Text style={[styles.value, styles.valueMultiline]} numberOfLines={2}>
            {businessData.businessAddress || "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address Proof</Text>
          <Text style={styles.value}>{businessData.addressProofType || "—"}</Text>
        </View>
      </View>

      {/* 2. Bank Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Bank Details</Text>
          <TouchableOpacity onPress={() => onEditStep(0)} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.value}>
            {businessData.bankAccountNumber || "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IFSC Code</Text>
          <Text style={styles.value}>{businessData.ifscCode || "—"}</Text>
        </View>
      </View>

      {/* 3. Documents Summary Card with Progress Bar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Uploaded Documents</Text>
          <TouchableOpacity onPress={() => onEditStep(1)} activeOpacity={0.7}>
            <Text style={styles.docCountText}>
              {uploadedCount}/{totalCount} Uploaded
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.docProgressBar}>
          <View style={[styles.docProgressFill, { width: `${progressPercent}%` }]} />
        </View>

        {uploadedDocs.length > 0 ? (
          <View style={styles.uploadedDocList}>
            {uploadedDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.uploadedDocItem}
                activeOpacity={0.7}
                onPress={() => setPreviewDoc(doc)}
              >
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <Text style={styles.uploadedDocName} numberOfLines={1}>
                  {doc.name}
                </Text>
                <View style={styles.eyeIconBox}>
                  <Ionicons name="eye-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {/* 4. Declaration Checkbox Card */}
      <TouchableOpacity
        style={styles.declarationCard}
        activeOpacity={0.8}
        onPress={onToggleDeclaration}
      >
        <View style={[styles.checkbox, declared && styles.checkboxActive]}>
          {declared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.declarationText}>
          I hereby declare that the information provided is true and accurate to the best of my knowledge. I authorise TaxEdge Fin Solutions to file this application on my behalf.
        </Text>
      </TouchableOpacity>

      {/* Full-Screen Document Preview Modal */}
      <Modal
        visible={Boolean(previewDoc)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalDocTitle} numberOfLines={1}>
                  {previewDoc?.name}
                </Text>
                <Text style={styles.modalDocSubtitle}>
                  Uploaded document verification
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewDoc(null)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalImageContainer}>
              {previewDoc?.fileUri ? (
                <Image
                  source={{ uri: previewDoc.fileUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.modalPlaceholder}>
                  <Ionicons name="document-text-outline" size={60} color="#94A3B8" />
                  <Text style={styles.modalPlaceholderText}>Preview not available</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalFooterBtn}
              activeOpacity={0.8}
              onPress={() => setPreviewDoc(null)}
            >
              <Text style={styles.modalFooterBtnText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  docCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  valueMultiline: {
    maxWidth: "60%",
    textAlign: "right",
  },
  docProgressBar: {
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  docProgressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },
  uploadedDocList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 10,
  },
  uploadedDocItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  uploadedDocName: {
    flex: 1,
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  eyeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EAF1FE",
    justifyContent: "center",
    alignItems: "center",
  },
  declarationCard: {
    flexDirection: "row",
    backgroundColor: "#FEF0E6",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFD8BF",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  declarationText: {
    flex: 1,
    fontSize: 12,
    color: "#9A3412",
    lineHeight: 18,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalHeaderInfo: {
    flex: 1,
    marginRight: 10,
  },
  modalDocTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  modalDocSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImageContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.52,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  modalPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalPlaceholderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#94A3B8",
  },
  modalFooterBtn: {
    margin: 14,
    height: 46,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooterBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
