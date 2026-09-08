import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../shared/theme";

const FILING_PERIODS = ["Monthly", "Quarterly", "Annual"];
const MONTHS = [
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
];
const FILING_TYPES = [
  "GSTR-3B (Monthly Summary & Tax Payment Return)",
  "GSTR-1 (Outward Supplies / Sales Invoices Return)",
  "GSTR-9 (Annual Comprehensive Return)",
  "CMP-08 (Composition Scheme Quarterly Statement)",
];

export interface GstFilingPeriodData {
  periodType: string;
  filingMonth: string;
  gstin: string;
  filingType: string;
}

interface GstFilingPeriodStepProps {
  data: GstFilingPeriodData;
  onChange: (fields: Partial<GstFilingPeriodData>) => void;
  onBlurField?: (field: keyof GstFilingPeriodData) => void;
  errors?: Record<string, string>;
}

export const GstFilingPeriodStep: React.FC<GstFilingPeriodStepProps> = ({
  data,
  onChange,
  onBlurField,
  errors = {},
}) => {
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleGstinChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    onChange({ gstin: cleaned });
  };

  return (
    <View style={styles.container}>
      {/* 1. Select Filing Frequency (Pills) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Select Filing Frequency *</Text>
        <View style={styles.periodPillsRow}>
          {FILING_PERIODS.map((period) => {
            const isSelected = data.periodType === period;
            return (
              <TouchableOpacity
                key={period}
                activeOpacity={0.8}
                onPress={() => {
                  onChange({ periodType: period });
                  onBlurField?.("periodType");
                }}
                style={[styles.periodPill, isSelected && styles.periodPillActive]}
              >
                <Text
                  style={[
                    styles.periodPillText,
                    isSelected && styles.periodPillTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.periodType ? (
          <Text style={styles.errorText}>{errors.periodType}</Text>
        ) : null}
      </View>

      {/* 2. Filing Month / Return Period Dropdown */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Filing Month / Return Period *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowMonthModal(true)}
          style={[styles.selectInput, errors.filingMonth && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.filingMonth && styles.placeholderText]}>
            {data.filingMonth || "Select return period"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>
        {errors.filingMonth ? (
          <Text style={styles.errorText}>{errors.filingMonth}</Text>
        ) : null}
      </View>

      {/* 3. GSTIN (15-Character) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>GSTIN (15-Character) *</Text>
        <TextInput
          style={[styles.input, errors.gstin && styles.inputError]}
          placeholder="e.g. 29AAAAA0000A1Z5"
          placeholderTextColor="#94A3B8"
          value={data.gstin}
          onChangeText={handleGstinChange}
          onBlur={() => onBlurField?.("gstin")}
          autoCapitalize="characters"
          maxLength={15}
        />
        {errors.gstin ? <Text style={styles.errorText}>{errors.gstin}</Text> : null}
      </View>

      {/* 4. Filing Return Type Dropdown */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Filing Return Type *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowTypeModal(true)}
          style={[styles.selectInput, errors.filingType && styles.inputError]}
        >
          <Text
            style={[styles.selectText, !data.filingType && styles.placeholderText]}
            numberOfLines={1}
          >
            {data.filingType || "Select return type (e.g. GSTR-3B)"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>
        {errors.filingType ? (
          <Text style={styles.errorText}>{errors.filingType}</Text>
        ) : null}
      </View>

      {/* 5. Compliance & Deadlines Advisory Card (Replacing hardcoded static previous rows) */}
      <View style={styles.guideCard}>
        <View style={styles.guideHeader}>
          <Ionicons name="information-circle" size={18} color="#2563EB" />
          <Text style={styles.guideTitle}>GST Compliance & Due Dates</Text>
        </View>
        <View style={styles.guideList}>
          <View style={styles.guideItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.guideText}>
              <Text style={styles.boldGuideText}>GSTR-1 (Sales):</Text> Due on 11th of every month. File all outgoing B2B & B2C invoices.
            </Text>
          </View>
          <View style={styles.guideItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.guideText}>
              <Text style={styles.boldGuideText}>GSTR-3B (Summary):</Text> Due on 20th of every month. Reconcile Input Tax Credit (ITC) and pay net tax.
            </Text>
          </View>
          <View style={styles.guideItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.guideText}>
              <Text style={styles.boldGuideText}>TaxEdge CA Review:</Text> Once you upload invoices, our CA verifies purchase registers against GSTR-2B before final filing.
            </Text>
          </View>
        </View>
      </View>

      {/* Month Selection Modal */}
      <Modal visible={showMonthModal} transparent animationType="fade" onRequestClose={() => setShowMonthModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Filing Month</Text>
            <FlatList
              data={MONTHS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = data.filingMonth === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onChange({ filingMonth: item });
                      setShowMonthModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={BrandColors.PRIMARY_ORANGE} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filing Type Selection Modal */}
      <Modal visible={showTypeModal} transparent animationType="fade" onRequestClose={() => setShowTypeModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Return Type</Text>
            <FlatList
              data={FILING_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = data.filingType === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onChange({ filingType: item });
                      setShowTypeModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]} numberOfLines={2}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={BrandColors.PRIMARY_ORANGE} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 6,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  periodPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  periodPill: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  periodPillActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  periodPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  periodPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  selectInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#94A3B8",
  },
  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  guideCard: {
    backgroundColor: "#F0F6FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginTop: 6,
    marginBottom: 10,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E3A8A",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  guideList: {
    gap: 8,
  },
  guideItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginTop: 6,
  },
  guideText: {
    flex: 1,
    fontSize: 12,
    color: "#1E3A8A",
    lineHeight: 17,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  boldGuideText: {
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 14,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderRadius: 10,
  },
  modalOptionSelected: {
    backgroundColor: "#FEF0E6",
  },
  modalOptionText: {
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  modalOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: "700",
  },
});
