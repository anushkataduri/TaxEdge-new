import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { BrandColors } from "../../../shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "pending";
}

interface GstApplicationStatusStepProps {
  appId?: string;
  appliedDate?: string;
  businessName?: string;
  serviceName?: string;
  estCompletion?: string;
}

const TIMELINE_STEPS: TimelineItem[] = [
  { id: "1", title: "Application Submitted", subtitle: "Form & documents received", status: "completed" },
  { id: "2", title: "Document Verification", subtitle: "Assigned CA reviewing proofs", status: "active" },
  { id: "3", title: "TRN Generation", subtitle: "Temporary Reference Number creation", status: "pending" },
  { id: "4", title: "Filed with GST Portal", subtitle: "Submission to GST department", status: "pending" },
  { id: "5", title: "ARN Generated", subtitle: "Acknowledgement number issued", status: "pending" },
  { id: "6", title: "GST Certificate Issued", subtitle: "GSTIN & certificate delivered", status: "pending" },
];

export const GstApplicationStatusStep: React.FC<GstApplicationStatusStepProps> = ({
  appId = "GST-2026-84920",
  appliedDate = "Today",
  businessName = "Your Business",
  serviceName = "GST Registration",
  estCompletion = "3-5 Business Days",
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace("/(main)/home");
  };

  const handleGoApplications = () => {
    router.replace("/(main)/applications");
  };

  return (
    <View style={styles.container}>
      {/* Success Celebration Header */}
      <View style={styles.successBanner}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.successTextContainer}>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your GST application has been successfully filed with TaxEdge.
          </Text>
        </View>
      </View>

      {/* Hero Application Status Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroAppIdLabel}>APPLICATION ID</Text>
            <Text style={styles.heroAppIdValue}>{appId}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Under Verification</Text>
          </View>
        </View>

        <View style={styles.heroDetailsRow}>
          <View style={styles.heroCol}>
            <Text style={styles.colLabel}>Business</Text>
            <Text style={styles.colValue} numberOfLines={1}>
              {businessName}
            </Text>
          </View>
          <View style={styles.heroCol}>
            <Text style={styles.colLabel}>Applied On</Text>
            <Text style={styles.colValue}>{appliedDate}</Text>
          </View>
          <View style={styles.heroCol}>
            <Text style={styles.colLabel}>Est. Completion</Text>
            <Text style={styles.colValue}>{estCompletion}</Text>
          </View>
        </View>
      </View>

      {/* Application Progress Timeline */}
      <Text style={styles.sectionHeading}>Application Progress</Text>
      <View style={styles.timelineList}>
        {TIMELINE_STEPS.map((step, idx) => {
          const isLast = idx === TIMELINE_STEPS.length - 1;
          return (
            <View key={step.id} style={styles.timelineRow}>
              {/* Timeline Indicator Column */}
              <View style={styles.timelineLeftCol}>
                {step.status === "completed" && (
                  <View style={styles.circleCompleted}>
                    <Ionicons name="checkmark" size={14} color={BrandColors.PRIMARY_ORANGE} />
                  </View>
                )}
                {step.status === "active" && (
                  <View style={styles.circleActive}>
                    <View style={styles.innerDotActive} />
                  </View>
                )}
                {step.status === "pending" && (
                  <View style={styles.circlePending}>
                    <View style={styles.innerDotPending} />
                  </View>
                )}
                {!isLast && (
                  <View
                    style={[
                      styles.timelineTrack,
                      step.status === "completed" && styles.timelineTrackCompleted,
                    ]}
                  />
                )}
              </View>

              {/* Timeline Content */}
              <View style={styles.timelineRightCol}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.status === "pending" && styles.stepTitlePending,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.actionButtonsCol}>
        <TouchableOpacity
          style={styles.primaryHomeBtn}
          activeOpacity={0.85}
          onPress={handleGoHome}
        >
          <Ionicons name="home" size={18} color="#FFFFFF" />
          <Text style={styles.primaryHomeBtnText}>Go to Home Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAppBtn}
          activeOpacity={0.8}
          onPress={handleGoApplications}
        >
          <Ionicons name="folder-open-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.secondaryAppBtnText}>Track in My Applications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactSupportBtn}
          activeOpacity={0.8}
          onPress={() => router.push("/chat/support")}
        >
          <Ionicons name="chatbubbles-outline" size={17} color="#64748B" />
          <Text style={styles.contactSupportBtnText}>Contact Support / CA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
  },
  successIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#065F46",
  },
  successSubtitle: {
    fontSize: 12,
    color: "#047857",
    marginTop: 2,
    lineHeight: 16,
  },
  heroCard: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#083B75",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroAppIdLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroAppIdValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#92400E",
  },
  heroDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    paddingTop: 14,
  },
  heroCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    marginBottom: 3,
  },
  colValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  timelineList: {
    paddingLeft: 4,
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 50,
  },
  timelineLeftCol: {
    alignItems: "center",
    width: 32,
    marginRight: 12,
  },
  circleCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FEF0E6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD8BF",
  },
  circleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  innerDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  circlePending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  innerDotPending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
  },
  timelineTrack: {
    flex: 1,
    width: 2,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  timelineTrackCompleted: {
    backgroundColor: "#FFD8BF",
  },
  timelineRightCol: {
    flex: 1,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  stepTitlePending: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  stepSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  actionButtonsCol: {
    gap: 10,
    marginTop: 4,
  },
  primaryHomeBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryHomeBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  secondaryAppBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAF1FE",
    borderWidth: 1,
    borderColor: "rgba(8, 59, 117, 0.15)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryAppBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  contactSupportBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  contactSupportBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
});
