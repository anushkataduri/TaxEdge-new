import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import type { TimelineStep } from "../../types/domain";
import { styles } from "../../styles/app/application/[id].styles";

type DetailTab = "OVERVIEW" | "STATUS" | "DOCUMENTS" | "PAYMENTS";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "STATUS", label: "Status" },
  { id: "DOCUMENTS", label: "Documents" },
  { id: "PAYMENTS", label: "Payments" },
];

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "Today";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (months.some((m) => dateStr.includes(m))) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {}
  return dateStr;
}

function calculateExpectedDate(dateStr?: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + 2);
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {}
  return "1–2 Business Days";
}

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const applications = useApplicationStore((state) => state.applications);
  const uploadDocument = useApplicationStore((state) => state.uploadDocument);
  const app = applications.find((a) => a.id === id);

  const [activeTab, setActiveTab] = useState<DetailTab>("OVERVIEW");

  if (!app) {
    return (
      <View style={[styles.container, { backgroundColor: "#0A2346", paddingTop: insets.top + 20 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2346" />
        <View style={styles.topNavRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="chevron-back" size={22} color="#FFF" /></TouchableOpacity>
          <Text style={styles.navTitle}>Not Found</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color="#EA580C" />
          <Text style={styles.errorText}>Application not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.actionBtnFilled}><Text style={styles.actionBtnFilledText}>Return to Applications</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentCustomerName = useAuthStore.getState().customer?.name;
  const applicantName =
    app.formData?.businessName ||
    app.formData?.tradeName ||
    app.formData?.applicantName ||
    currentCustomerName ||
    "Verified Business";

  const appliedDate = formatDisplayDate(app.createdAt);
  const assignedCA = app.assignedExecutive ? `CA ${app.assignedExecutive}` : "CA Vikram";
  const expectedDate = calculateExpectedDate(app.createdAt);
  const uploadedDocs = app.documents.filter((d) => d.status === "Uploaded").length;

  const totalAmount = app.paymentAmount;
  const baseServiceFee = Math.round(app.paymentAmount / 1.18);
  const gstAmount = app.paymentAmount - baseServiceFee;
  const isPaid = app.paymentStatus === "Paid";

  const timelineSteps: TimelineStep[] = (app.timeline && app.timeline.length > 0) ? app.timeline : [
    { title: "Application Submitted", description: "Application filed online with documents", status: "completed", date: appliedDate },
    { title: "Staff Verification", description: "CA reviewing invoices & reconciliation", status: "current", date: appliedDate },
    { title: "Filing Submission", description: "Submission to GST portal", status: "pending" },
    { title: "Filing Completed", description: "ARN generated and confirmation delivered", status: "pending" },
  ];

  const handleDocumentUpload = async (docName: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        uploadDocument(app.id, docName, res.assets[0].uri);
      }
    } catch {
      uploadDocument(app.id, docName, `file://uploaded/${docName}.pdf`);
    }
  };

  const headerInfo = {
    OVERVIEW: { nav: "Application Details", title: app.serviceName, sub: `${applicantName} • ${appliedDate}` },
    STATUS: { nav: "Application Status", title: app.serviceId === "gst-filing" ? "Staff Verification" : "Document Verification", sub: `Assigned CA: ${assignedCA} • Target: ${expectedDate}` },
    DOCUMENTS: { nav: "Required Documents", title: "Document Uploads", sub: `${uploadedDocs} of ${app.documents.length} documents uploaded` },
    PAYMENTS: { nav: "Payment Details", title: "Invoice & Fees", sub: `Total: ₹${totalAmount.toLocaleString()} • Status: ${app.paymentStatus}` },
  }[activeTab];

  const overviewRows = [
    { key: "Customer / Entity", val: applicantName },
    { key: "Service", val: app.serviceName },
    { key: "Application ID", val: app.id },
    { key: "Applied Date", val: appliedDate },
    { key: "Assigned CA", val: assignedCA },
    { key: "Expected Completion", val: expectedDate },
  ];

  // GST Return Filing specific metadata card
  const filingRows = app.formData?.gstin ? [
    { key: "GSTIN", val: app.formData.gstin },
    { key: "Business Entity", val: app.formData.businessName || app.formData.tradeName || applicantName },
    ...(app.formData.taxpayerScheme ? [{ key: "Taxpayer Scheme", val: app.formData.taxpayerScheme }] : []),
    ...(app.formData.filingNature ? [{ key: "Filing Nature", val: app.formData.filingNature }] : []),
    ...(app.formData.financialYear ? [{ key: "Financial Year", val: app.formData.financialYear }] : []),
    ...(app.formData.filingPeriod ? [{ key: "Filing Period", val: app.formData.filingPeriod }] : []),
    ...(app.formData.filingFrequency ? [{ key: "Filing Frequency", val: app.formData.filingFrequency }] : []),
    ...(app.formData.filingType ? [{ key: "Return Form", val: app.formData.filingType }] : []),
    ...(app.formData.calculationMethod ? [{
      key: "Calculation Method",
      val: app.formData.calculationMethod === "estimated" ? "Self Estimated Figures" : "TaxEdge CA Assisted (Documents)"
    }] : []),
  ] : [];

  // Estimated Tax Figures if supplied
  const hasEstimates = Boolean(app.formData?.turnover || app.formData?.eligibleItc);
  const turnoverNum = Number(app.formData?.turnover || 0);
  const outputGstNum = Math.round(turnoverNum * 0.18);
  const itcNum = Number(app.formData?.eligibleItc || 0);
  const netLiabilityNum = Math.max(0, outputGstNum - itcNum);

  const estimateRows = hasEstimates ? [
    { key: "Gross Taxable Turnover", val: `₹${turnoverNum.toLocaleString()}` },
    { key: "Estimated Output GST (18%)", val: `₹${outputGstNum.toLocaleString()}` },
    { key: "Eligible Input Tax Credit", val: `- ₹${itcNum.toLocaleString()}` },
    { key: "Net Tax Liability (Govt)", val: `₹${netLiabilityNum.toLocaleString()}` },
  ] : [];

  // GST Registration specific details
  const registrationRows = (!app.formData?.gstin && app.formData?.businessName) ? [
    { key: "Business Name", val: app.formData.businessName },
    ...(app.formData.businessType ? [{ key: "Business Type", val: app.formData.businessType }] : []),
    ...(app.formData.state ? [{ key: "State", val: app.formData.state }] : []),
    ...(app.formData.pan ? [{ key: "PAN", val: app.formData.pan }] : []),
  ] : [];

  const paymentRows = [
    { key: "Service Fee", val: `₹${baseServiceFee.toLocaleString()}` },
    { key: "Government Fees", val: "₹0 (Included)" },
    { key: "Platform GST (18%)", val: `₹${gstAmount.toLocaleString()}` },
    ...(app.formData?.transactionId ? [{ key: "Transaction ID", val: app.formData.transactionId }] : []),
    ...(app.formData?.paymentMethod ? [{ key: "Payment Method", val: app.formData.paymentMethod }] : []),
    { key: "Payment Date", val: appliedDate },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* ---------------- ROYAL NAVY HEADER ---------------- */}
      <View style={[styles.navyHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topNavRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{headerInfo.nav}</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={{ paddingHorizontal: 2 }}>
          <Text style={styles.appIdLabel}>{`APPLICATION #${app.id}`}</Text>
          <Text style={styles.serviceTitle}>{headerInfo.title}</Text>
          <Text style={styles.serviceSubtitle}>{headerInfo.sub}</Text>
        </View>
      </View>

      {/* ---------------- 4 TABS ROW ---------------- */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} activeOpacity={0.7} onPress={() => setActiveTab(tab.id)} style={styles.tabItem}>
              <Text style={[styles.tabLabel, { color: isActive ? "#FF5722" : "#0A2346", fontWeight: isActive ? "700" : "600" }]} numberOfLines={1} adjustsFontSizeToFit>
                {tab.label}
              </Text>
              <View style={isActive ? styles.activeTabIndicator : styles.inactiveTabIndicator} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ---------------- SCROLLABLE BODY ---------------- */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <>
            {/* General Application Info */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="information-circle-outline" size={20} color="#083B75" />
                <Text style={styles.cardHeaderTitle}>Application Info</Text>
              </View>
              <View style={{ gap: 10 }}>
                {overviewRows.map((r, i) => (
                  <React.Fragment key={r.key}>
                    {i > 0 && <View style={styles.infoDivider} />}
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>{r.key}</Text>
                      <Text style={styles.infoVal}>{r.val}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* GST Filing Details */}
            {filingRows.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="document-text-outline" size={20} color="#083B75" />
                  <Text style={styles.cardHeaderTitle}>Filing Details</Text>
                </View>
                <View style={{ gap: 10 }}>
                  {filingRows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      {i > 0 && <View style={styles.infoDivider} />}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{r.key}</Text>
                        <Text style={[styles.infoVal, r.key === "GSTIN" ? { letterSpacing: 0.5, color: "#EA580C" } : null]}>
                          {r.val}
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Estimated Tax Computation */}
            {estimateRows.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="calculator-outline" size={20} color="#083B75" />
                  <Text style={styles.cardHeaderTitle}>Tax Computation (Estimated)</Text>
                </View>
                <View style={{ gap: 10 }}>
                  {estimateRows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      {i > 0 && <View style={styles.infoDivider} />}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{r.key}</Text>
                        <Text style={[styles.infoVal, r.key.includes("Credit") ? { color: "#059669" } : null]}>
                          {r.val}
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Business Registration Details */}
            {registrationRows.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="business-outline" size={20} color="#083B75" />
                  <Text style={styles.cardHeaderTitle}>Business Registration Details</Text>
                </View>
                <View style={{ gap: 10 }}>
                  {registrationRows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      {i > 0 && <View style={styles.infoDivider} />}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{r.key}</Text>
                        <Text style={styles.infoVal}>{r.val}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* TAB 2: STATUS */}
        {activeTab === "STATUS" && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="git-branch-outline" size={20} color="#083B75" />
              <Text style={styles.cardHeaderTitle}>Status Timeline</Text>
            </View>
            <View style={{ paddingLeft: 4, paddingTop: 4 }}>
              {timelineSteps.map((step, index) => {
                const isLast = index === timelineSteps.length - 1;
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";
                return (
                  <View key={index} style={{ flexDirection: "row", marginBottom: 6 }}>
                    <View style={{ alignItems: "center", width: 28, marginRight: 10 }}>
                      {isCompleted ? (
                        <View style={styles.completedCircle}><Ionicons name="checkmark" size={12} color="#FFF" /></View>
                      ) : isCurrent ? (
                        <View style={styles.currentCircle}><Ionicons name="play" size={10} color="#FFF" /></View>
                      ) : (
                        <View style={styles.pendingCircle} />
                      )}
                      {!isLast && <View style={[styles.timelineConnectingLine, { backgroundColor: isCompleted ? "#16A34A" : isCurrent ? "#FED7AA" : "#E2E8F0" }]} />}
                    </View>
                    <View style={styles.timelineContentCol}>
                      <View style={styles.timelineStepTopRow}>
                        <Text style={[styles.timelineStepTitle, { color: isCurrent ? "#EA580C" : isCompleted ? "#0F172A" : "#64748B", fontWeight: isCurrent || isCompleted ? "700" : "600" }]}>{step.title}</Text>
                        {step.date && <Text style={styles.timelineStepDate}>{step.date}</Text>}
                      </View>
                      <Text style={styles.timelineStepSub}>{step.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === "DOCUMENTS" && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="folder-open-outline" size={20} color="#083B75" />
              <Text style={styles.cardHeaderTitle}>Filing Documents</Text>
            </View>
            <View style={{ gap: 12 }}>
              {app.documents.map((doc, i) => {
                const isUploaded = doc.status === "Uploaded";
                return (
                  <View key={i} style={styles.docItemCard}>
                    <View style={styles.docIconWrap}>
                      <Ionicons name={isUploaded ? "checkmark-circle" : "document-text-outline"} size={24} color={isUploaded ? "#059669" : "#EA580C"} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 8, justifyContent: "center" }}>
                      <Text style={styles.docNameText}>{doc.name}</Text>
                      {doc.fileUri && (
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }} numberOfLines={1}>
                          {doc.fileUri.split("/").pop()}
                        </Text>
                      )}
                    </View>
                    {!isUploaded ? (
                      <TouchableOpacity activeOpacity={0.8} onPress={() => handleDocumentUpload(doc.name)} style={styles.uploadPeachBtn}>
                        <Text style={styles.uploadPeachBtnText}>Upload</Text>
                        <Ionicons name="cloud-upload-outline" size={15} color="#EA580C" />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.uploadedPill, { backgroundColor: "#ECFDF5" }]}>
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={[styles.uploadedPillText, { color: "#059669" }]}>Uploaded</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 4: PAYMENTS */}
        {activeTab === "PAYMENTS" && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="card-outline" size={20} color="#083B75" />
              <Text style={styles.cardHeaderTitle}>Payment Summary</Text>
            </View>
            <View style={{ gap: 10 }}>
              {paymentRows.map((r, i) => (
                <React.Fragment key={r.key}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>{r.key}</Text>
                    <Text style={[styles.infoVal, r.key === "Transaction ID" ? { fontSize: 12.5, color: "#64748B" } : null]}>
                      {r.val}
                    </Text>
                  </View>
                  <View style={styles.infoDivider} />
                </React.Fragment>
              ))}
              <View style={styles.infoRow}>
                <Text style={[styles.infoKey, { fontWeight: "700", color: "#0A2346" }]}>Total Paid</Text>
                <Text style={[styles.infoVal, { color: "#EA580C", fontSize: 16 }]}>₹{totalAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Payment Status</Text>
                <View style={[styles.statusPillSmall, { backgroundColor: isPaid ? "#ECFDF5" : "#FFF1E8" }]}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: isPaid ? "#059669" : "#EA580C" }}>
                    {app.paymentStatus}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ---------------- FIXED BOTTOM ACTION BUTTON ---------------- */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/chat/support")} style={styles.actionBtnFilled}>
          <Ionicons name="headset-outline" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnFilledText}>Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


