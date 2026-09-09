import React, { useState, useEffect } from "react";
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
import { gstApi } from "../../services/gstApi";

const FILING_PERIODS = ["Monthly", "Quarterly", "Annual"];

export const FINANCIAL_YEARS = [
  "FY 2026-27",
  "FY 2025-26",
  "FY 2024-25",
  "FY 2023-24",
];

export const getFilingPeriodsForFrequency = (
  frequency: string,
  financialYear: string = "FY 2025-26"
): string[] => {
  // Parse financial year (e.g. "FY 2025-26" -> y1 = 2025, y2 = 2026)
  const match = financialYear.match(/(\d{4})-(\d{2})/);
  let y1 = 2025;
  let y2 = 2026;
  if (match) {
    y1 = parseInt(match[1], 10);
    const prefix = match[1].slice(0, 2);
    y2 = parseInt(`${prefix}${match[2]}`, 10);
  }

  if (frequency === "Quarterly") {
    return [
      `Q1 (Apr–Jun ${y1})`,
      `Q2 (Jul–Sep ${y1})`,
      `Q3 (Oct–Dec ${y1})`,
      `Q4 (Jan–Mar ${y2})`,
    ];
  }

  if (frequency === "Annual") {
    return [
      `${financialYear} (Full Year Return)`,
    ];
  }

  // Default: Monthly
  return [
    `April ${y1}`,
    `May ${y1}`,
    `June ${y1}`,
    `July ${y1}`,
    `August ${y1}`,
    `September ${y1}`,
    `October ${y1}`,
    `November ${y1}`,
    `December ${y1}`,
    `January ${y2}`,
    `February ${y2}`,
    `March ${y2}`,
  ];
};

export const getReturnTypesForFrequency = (frequency: string): string[] => {
  if (frequency === "Quarterly") {
    return [
      "GSTR-1 (QRMP — Quarterly)",
      "GSTR-3B (QRMP — Quarterly)",
      "GSTR-4 (Composition Dealer)",
      "CMP-08 (Composition Scheme Quarterly Statement)",
    ];
  }
  if (frequency === "Annual") {
    return [
      "GSTR-9 (Annual Comprehensive Return)",
      "GSTR-9C (Reconciliation Statement)",
    ];
  }
  // Default: Monthly
  return [
    "GSTR-3B (Monthly Summary Return)",
    "GSTR-1 (Outward Supplies)",
  ];
};

export interface GstFilingPeriodData {
  periodType: string;
  financialYear?: string;
  filingPeriod?: string;
  filingMonth: string;
  gstin: string;
  filingType: string;
  filingNature?: "Regular Return" | "Nil Return";
  businessName?: string;
  tradeName?: string;
  legalName?: string;
  taxpayerScheme?: string;
  state?: string;
  isVerifiedEntity?: boolean;
  calculationMethod?: "ca_assisted" | "manual_estimates";
  taxableSales?: string;
  turnover?: string;
  exemptSales?: string;
  taxablePurchases?: string;
  eligibleItc?: string;
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
  const [showYearModal, setShowYearModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Auto-verify if 15-char GSTIN is already provided (e.g. from draft or account)
  useEffect(() => {
    if (data.gstin && data.gstin.length === 15 && !data.isVerifiedEntity) {
      gstApi.lookupGstin(data.gstin).then((entity) => {
        if (entity) {
          onChange({
            businessName: entity.legalName,
            tradeName: entity.tradeName,
            taxpayerScheme: entity.taxpayerScheme,
            state: entity.state,
            isVerifiedEntity: true,
          });
        }
      });
    }
  }, [data.gstin]);

  const handleGstinChange = async (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    onChange({ gstin: cleaned });

    if (cleaned.length === 15) {
      setIsLookingUp(true);
      const entity = await gstApi.lookupGstin(cleaned);
      setIsLookingUp(false);
      if (entity) {
        onChange({
          gstin: cleaned,
          businessName: entity.legalName,
          tradeName: entity.tradeName,
          taxpayerScheme: entity.taxpayerScheme,
          state: entity.state,
          isVerifiedEntity: true,
        });
      }
    } else if (data.isVerifiedEntity) {
      onChange({
        isVerifiedEntity: false,
        businessName: undefined,
        tradeName: undefined,
        taxpayerScheme: undefined,
      });
    }
  };

  const currentPeriods = getFilingPeriodsForFrequency(
    data.periodType,
    data.financialYear || "FY 2025-26"
  );
  const currentReturnTypes = getReturnTypesForFrequency(data.periodType);

  const getPeriodModalTitle = () => {
    if (data.periodType === "Quarterly") return "Select Filing Quarter";
    if (data.periodType === "Monthly") return "Select Filing Month";
    if (data.periodType === "Annual") return "Select Filing Year";
    return "Select Filing Period";
  };

  const selectedPeriodValue = data.filingPeriod || data.filingMonth;

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
                  onChange({
                    periodType: period,
                    filingPeriod: "",
                    filingMonth: "",
                    filingType: "",
                  });
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
        <Text style={styles.frequencyHint}>
          Frequency filters both the period list and the return types below.
        </Text>
        {errors.periodType ? (
          <Text style={styles.errorText}>{errors.periodType}</Text>
        ) : null}
      </View>

      {/* 2. Financial Year Dropdown */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Financial Year *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowYearModal(true)}
          style={[styles.selectInput, errors.financialYear && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.financialYear && styles.placeholderText]}>
            {data.financialYear || "Select financial year"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>
        {errors.financialYear ? (
          <Text style={styles.errorText}>{errors.financialYear}</Text>
        ) : null}
      </View>

      {/* 3. Filing Period / Return Period Dropdown */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Filing Period / Return Period *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowPeriodModal(true)}
          style={[styles.selectInput, (errors.filingPeriod || errors.filingMonth) && styles.inputError]}
        >
          <Text style={[styles.selectText, !selectedPeriodValue && styles.placeholderText]}>
            {selectedPeriodValue || "Select return period"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>
        {(errors.filingPeriod || errors.filingMonth) ? (
          <Text style={styles.errorText}>{errors.filingPeriod || errors.filingMonth}</Text>
        ) : null}
      </View>

      {/* 4. GSTIN (15-Character) */}
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

        {/* Backend-Verified Entity Card (auto-resolved from GST portal) */}
        {data.isVerifiedEntity && (
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedTopRow}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={15} color="#059669" />
                <Text style={styles.verifiedBadgeText}>Verified from GST Portal</Text>
              </View>
              <Text style={styles.verifiedStateText}>{data.state || "Active"}</Text>
            </View>
            <Text style={styles.verifiedTradeName}>{data.tradeName || data.businessName}</Text>
            <Text style={styles.verifiedLegalName}>{data.businessName}</Text>
            <View style={styles.schemePill}>
              <Text style={styles.schemePillText}>{data.taxpayerScheme || "Regular Scheme"}</Text>
            </View>
          </View>
        )}
      </View>

      {/* 5. Filing Return Type Dropdown */}
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
            {data.filingType || "Select return type"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>
        {errors.filingType ? (
          <Text style={styles.errorText}>{errors.filingType}</Text>
        ) : null}
      </View>

      {/* 6. Filing Type (Regular vs Nil) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Filing Type *</Text>
        <View style={styles.periodPillsRow}>
          {(["Regular Return", "Nil Return"] as const).map((type) => {
            const isSelected = (data.filingNature || "Regular Return") === type;
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.8}
                onPress={() => onChange({ filingNature: type })}
                style={[styles.periodPill, isSelected && styles.periodPillActive]}
              >
                <Text
                  style={[
                    styles.periodPillText,
                    isSelected && styles.periodPillTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 7. Tax Calculation Method (Default: CA Assisted from Invoices) */}
      {data.filingNature !== "Nil Return" && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tax Calculation Method</Text>
          <TouchableOpacity
            style={[
              styles.methodCard,
              (!data.calculationMethod || data.calculationMethod === "ca_assisted") && styles.methodCardActive,
            ]}
            onPress={() => onChange({ calculationMethod: "ca_assisted" })}
            activeOpacity={0.8}
          >
            <Ionicons
              name={(!data.calculationMethod || data.calculationMethod === "ca_assisted") ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={(!data.calculationMethod || data.calculationMethod === "ca_assisted") ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodTitle}>Let TaxEdge CA calculate from documents</Text>
              <Text style={styles.methodSubtitle}>Upload your invoices & GSTR-2B; our CA computes sales, purchases & ITC</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              data.calculationMethod === "manual_estimates" && styles.methodCardActive,
              { marginTop: 8 },
            ]}
            onPress={() => onChange({ calculationMethod: "manual_estimates" })}
            activeOpacity={0.8}
          >
            <Ionicons
              name={data.calculationMethod === "manual_estimates" ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={data.calculationMethod === "manual_estimates" ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodTitle}>I already have estimated figures (Optional)</Text>
              <Text style={styles.methodSubtitle}>Quickly provide estimated sales, purchases, or ITC summary</Text>
            </View>
          </TouchableOpacity>

          {data.calculationMethod === "manual_estimates" && (
            <View style={styles.estimatesContainer}>
              <View style={styles.estimateInputRow}>
                <Text style={styles.estimateLabel}>Estimated Taxable Sales (₹)</Text>
                <TextInput
                  style={styles.estimateInput}
                  placeholder="e.g. 4,25,000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={data.taxableSales}
                  onChangeText={(val) => onChange({ taxableSales: val })}
                />
              </View>
              <View style={styles.estimateInputRow}>
                <Text style={styles.estimateLabel}>Estimated Taxable Purchases (₹)</Text>
                <TextInput
                  style={styles.estimateInput}
                  placeholder="e.g. 2,15,000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={data.taxablePurchases}
                  onChangeText={(val) => onChange({ taxablePurchases: val })}
                />
              </View>
              <View style={styles.estimateInputRow}>
                <Text style={styles.estimateLabel}>Estimated Eligible ITC (₹)</Text>
                <TextInput
                  style={styles.estimateInput}
                  placeholder="e.g. 22,500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={data.eligibleItc}
                  onChangeText={(val) => onChange({ eligibleItc: val })}
                />
              </View>
            </View>
          )}
        </View>
      )}


      {/* Financial Year Selection Modal */}
      <Modal visible={showYearModal} transparent animationType="fade" onRequestClose={() => setShowYearModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Financial Year</Text>
            <FlatList
              data={FINANCIAL_YEARS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = data.financialYear === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onChange({
                        financialYear: item,
                        filingPeriod: "",
                        filingMonth: "",
                      });
                      setShowYearModal(false);
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

      {/* Period Selection Modal (Monthly / Quarterly / Annual) */}
      <Modal visible={showPeriodModal} transparent animationType="fade" onRequestClose={() => setShowPeriodModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getPeriodModalTitle()}</Text>
            <FlatList
              data={currentPeriods}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedPeriodValue === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onChange({
                        filingPeriod: item,
                        filingMonth: item,
                      });
                      setShowPeriodModal(false);
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
              data={currentReturnTypes}
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
  frequencyHint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 16,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
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
  verifiedCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    marginTop: 8,
  },
  verifiedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#15803D",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  verifiedStateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  verifiedTradeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14532D",
    marginBottom: 2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  verifiedLegalName: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 6,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  schemePill: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schemePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369A1",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  methodCardActive: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFFBF7",
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  methodSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  estimatesContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  estimateInputRow: {
    marginBottom: 4,
  },
  estimateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  estimateInput: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
});
