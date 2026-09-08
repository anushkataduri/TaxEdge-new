import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../shared/theme";

interface GstFilingReviewStepProps {
  gstin?: string;
  filingMonth?: string;
  filingType?: string;
  filingFrequency?: string;
  uploadedDocsCount?: number;
  onApprove: () => void;
  onRequestChanges?: () => void;
}

export const GstFilingReviewStep: React.FC<GstFilingReviewStepProps> = ({
  gstin = "29ABCDE1234F1Z5",
  filingMonth = "July 2026",
  filingType = "GSTR-3B (Monthly Summary Return)",
  filingFrequency = "Monthly",
  uploadedDocsCount = 3,
  onApprove,
  onRequestChanges,
}) => {
  return (
    <View style={styles.container}>
      {/* Ready for Review Banner */}
      <View style={styles.readyCard}>
        <View style={styles.readyIconBox}>
          <Ionicons name="checkmark-sharp" size={16} color="#059669" />
        </View>
        <View style={styles.readyTextCol}>
          <Text style={styles.readyHeading}>Ready for Review</Text>
          <Text style={styles.readySub}>
            TaxEdge CA has prepared return computation based on your uploaded records
          </Text>
        </View>
      </View>

      {/* 1. Filing Overview Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filing Details</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>GSTIN</Text>
          <Text style={styles.value}>{gstin || "Not Provided"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Filing Period</Text>
          <Text style={styles.value}>{filingMonth}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Filing Frequency</Text>
          <Text style={styles.value}>{filingFrequency}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Return Form</Text>
          <Text style={styles.value}>{filingType.split(" ")[0]}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Attached Documents</Text>
          <Text style={styles.value}>{uploadedDocsCount} Files Verified</Text>
        </View>
      </View>

      {/* 2. Tax Computation Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tax Computation (Reconciled)</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Gross Taxable Turnover</Text>
          <Text style={styles.value}>₹4,25,000</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Output GST (18%)</Text>
          <Text style={styles.value}>₹38,250</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Eligible Input Tax Credit (ITC)</Text>
          <Text style={[styles.value, { color: "#16A34A" }]}>- ₹22,500</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Net Tax Liability (Govt)</Text>
          <Text style={styles.value}>₹15,750</Text>
        </View>
      </View>

      {/* 3. TaxEdge Professional Fee Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Professional Filing Fee</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>CA Consultancy & Reconciliation</Text>
          <Text style={styles.value}>₹1,986</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Platform GST (18%)</Text>
          <Text style={styles.value}>₹358</Text>
        </View>

        {/* Total Payable Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalValue}>₹2,344</Text>
        </View>
      </View>

      {/* Secondary Request Changes Button */}
      <TouchableOpacity
        style={styles.requestChangesBtn}
        activeOpacity={0.8}
        onPress={
          onRequestChanges ||
          (() =>
            Alert.alert(
              "Request CA Review",
              "A TaxEdge Chartered Accountant will contact you within 15 minutes to adjust any numbers."
            ))
        }
      >
        <Ionicons name="create-outline" size={16} color={BrandColors.PRIMARY_ORANGE} />
        <Text style={styles.requestChangesText}>Request Changes / Recalculate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    gap: 14,
    paddingBottom: 20,
  },
  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  readyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  readyTextCol: {
    flex: 1,
  },
  readyHeading: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  readySub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
    lineHeight: 16,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
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
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF0E6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  requestChangesBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  requestChangesText: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
});
