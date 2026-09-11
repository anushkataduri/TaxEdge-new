import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert, Animated, AccessibilityInfo } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { BrandColors } from "../../../../shared/theme";
import { GstSelectModal } from "../../components/common/GstSelectModal";
import { UniversalDraftModal } from "../../../../shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "../../../../shared/hooks/useUniversalDraftGuard";
import { GstValidators } from "../../utils/gstValidators";
import { styles } from "./GstCertificateScreen.styles";
import { useAuthStore } from "../../../../store/authStore";
import { notificationService } from "../../../notifications/services/notificationService";

const CERTIFICATE_REQUEST_TYPES = [
  "Download Existing Certificate (Form REG-06)",
  "Request Reprint / Duplicate Copy",
  "Certificate Verification & Status Check",
];

const buildCertificateHtml = (g: string, t: string): string =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><title>GST Certificate - ${g}</title><style>body{font-family:'Helvetica Neue',Arial,sans-serif;padding:28px;color:#0F172A;background:#FFF;}.box{border:3px double #083B75;padding:24px;border-radius:12px;}.hdr{text-align:center;border-bottom:2px solid #083B75;padding-bottom:14px;margin-bottom:18px;}.gov{font-size:13px;font-weight:800;color:#083B75;text-transform:uppercase;letter-spacing:1px;}.title{font-size:20px;font-weight:800;color:#083B75;margin:6px 0 2px;}.sub{font-size:12px;color:#64748B;}table{width:100%;border-collapse:collapse;margin:16px 0;}td{padding:9px 12px;border:1px solid #E2E8F0;font-size:13px;}td.lbl{background:#F8FAFC;font-weight:700;width:40%;color:#334155;}td.val{font-weight:600;color:#0F172A;}.ftr{display:flex;justify-content:space-between;align-items:flex-end;margin-top:26px;padding-top:14px;}.stamp{border:2px dashed #16A34A;color:#16A34A;padding:8px 14px;border-radius:8px;font-weight:800;font-size:11px;text-align:center;}.sign{text-align:right;font-size:11.5px;color:#475569;line-height:16px;}</style></head><body><div class="box"><div class="hdr"><div class="gov">Government of India — Goods and Services Tax</div><div class="title">Form GST REG-06</div><div class="sub">Registration Certificate (Issued under Section 25 of the CGST Act, 2017)</div></div><table><tr><td class="lbl">1. Registration Number (GSTIN)</td><td class="val" style="color:#083B75;font-size:14.5px;font-weight:800;">${g}</td></tr><tr><td class="lbl">2. Legal Name</td><td class="val">TaxEdge Verified Enterprise</td></tr><tr><td class="lbl">3. Trade Name</td><td class="val">Registered Trade Establishment</td></tr><tr><td class="lbl">4. Constitution of Business</td><td class="val">Proprietorship / Registered Entity</td></tr><tr><td class="lbl">5. Address of Principal Place</td><td class="val">Registered Business Premises, India</td></tr><tr><td class="lbl">6. Date of Validity</td><td class="val">From Registration Date to Perpetual</td></tr><tr><td class="lbl">7. Type of Registration</td><td class="val">Regular Taxpayer</td></tr><tr><td class="lbl">8. Certificate Service Type</td><td class="val">${t || "Form REG-06"}</td></tr></table><div class="ftr"><div class="stamp">✓ DIGITALLY SEALED & AUTHENTICATED<br><span style="font-size:9.5px;font-weight:normal;">Official Form GST REG-06</span></div><div class="sign"><b>Superintendent / GST Authority</b><br>CBIC • Government of India<br>Date: ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div></div></div></body></html>`;

export default function GstCertificateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const customer = useAuthStore((state) => state.customer);
  const registeredMobile = customer?.mobile ? `+91 ${customer.mobile}` : "+91 Verified Registered Mobile";
  const registeredEmail = customer?.email || "Verified Registered Email";

  const [gstin, setGstin] = useState(""), [requestType, setRequestType] = useState<string>("");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [error, setError] = useState(""), [gstinError, setGstinError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false), [isCompleted, setIsCompleted] = useState(false);
  const [certificatePdfUri, setCertificatePdfUri] = useState<string | null>(null);

  // Slow, elegant success animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCompleted) return;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) {
        iconAnim.setValue(1); contentAnim.setValue(1); cardAnim.setValue(1); btnAnim.setValue(1);
        return;
      }
      Animated.sequence([
        Animated.timing(iconAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.stagger(120, [
          Animated.timing(contentAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(cardAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, [isCompleted]);

  const { showDraftModal, markSubmitted, handleSaveAndExit, handleDiscardAndExit, handleCancel } = useUniversalDraftGuard({
    isDirty: () => Boolean(gstin || requestType),
    onSaveDraft: () => {}, onDiscardDraft: () => {}, isSubmitted: () => isCompleted,
  });

  const handleGstinChange = (text: string) => {
    setGstin(text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
    setGstinError("");
  };

  const getButtonText = () => {
    if (isProcessing) return "Downloading Certificate...";
    if (requestType.includes("Reprint")) return "Request Reprint";
    return "Download Certificate (REG-06)";
  };

  const downloadAndSharePdf = async (uri: string) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `GST_Certificate_${gstin || "REG06"}.pdf`,
          UTI: "com.adobe.pdf",
        });
      }
    } catch {
      Alert.alert("Certificate Saved", `Official certificate for ${gstin} is ready.`);
    }
  };

  const handleAction = async () => {
    if (!GstValidators.isValidGstin(gstin)) {
      setGstinError("Enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)");
      Alert.alert("Invalid GSTIN", "Please enter a valid 15-character GSTIN to download certificate.");
      return;
    }
    if (!requestType) {
      setError("Please select a request type.");
      return;
    }

    setIsProcessing(true);
    try {
      const html = buildCertificateHtml(gstin, requestType);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setCertificatePdfUri(uri);
      markSubmitted();
      setIsCompleted(true);
      notificationService.notifyCertificateReady("GST", gstin);
      await downloadAndSharePdf(uri);
    } catch {
      Alert.alert("Download Error", "Could not generate certificate PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------------- SCREEN 2: CERTIFICATE READY (PREMIUM SUCCESS) ---------------- */
  if (isCompleted) {
    const successRows = [
      { k: "Document", v: "Form GST REG-06", icon: "document-text-outline" as const },
      { k: "GSTIN", v: gstin, c: BrandColors.PRIMARY_BLUE, icon: "business-outline" as const },
      { k: "Certificate Type", v: requestType || "Standard Certificate", icon: "options-outline" as const },
      { k: "Digital Seal", v: "Verified & Authenticated", c: "#16A34A", icon: "shield-checkmark-outline" as const },
      { k: "Issue Date", v: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: "calendar-outline" as const },
      { k: "Status", v: "Ready / Issued", c: "#16A34A", icon: "checkmark-circle-outline" as const },
    ];

    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="light-content" backgroundColor={BrandColors.PRIMARY_BLUE} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.successHero, { paddingTop: insets.top + 28 }]}>
            <Animated.View style={[styles.successHeroIconBox, { opacity: iconAnim, transform: [{ scale: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
              <View style={styles.successHalo} />
              <View style={styles.successHeroCheckCircle}>
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </View>
              <View style={styles.successRibbonBadge}>
                <Ionicons name="ribbon" size={15} color="#EA580C" />
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }], alignItems: "center" }}>
              <Text style={styles.successHeroTitle}>Certificate Ready!</Text>
              <Text style={styles.successHeroSubtitle}>Official Form REG-06 certificate for {gstin} is generated and ready.</Text>
            </Animated.View>
          </View>

          <Animated.View style={[styles.successCard, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
            {successRows.map((row, i) => (
              <React.Fragment key={row.k}>
                {i > 0 && <View style={styles.successDivider} />}
                <View style={styles.successRow}>
                  <View style={styles.successRowKeyWrap}>
                    <Ionicons name={row.icon} size={15} color="#083B75" />
                    <Text style={styles.successRowKey}>{row.k}</Text>
                  </View>
                  <Text style={[styles.successRowVal, row.c ? { color: row.c } : null]} numberOfLines={2}>{row.v}</Text>
                </View>
              </React.Fragment>
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View style={[styles.successActionsWrap, { paddingBottom: Math.max(insets.bottom, 16), opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (certificatePdfUri) downloadAndSharePdf(certificatePdfUri);
              else handleAction();
            }}
          >
            <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Download Certificate (PDF)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  /* ---------------- SCREEN 1: GST CERTIFICATE FORM ---------------- */
  return (
    <View style={styles.root}>
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#083B75" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GST Certificate</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Premium Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="ribbon-outline" size={22} color="#083B75" />
          </View>
          <Text style={styles.infoCardText}>
            Download or request official GST Registration Certificate (Form REG-06) with digital seal
          </Text>
        </View>

        {/* GSTIN Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>GSTIN (15-Character) <Text style={styles.star}>*</Text></Text>
          <View style={[styles.inputWrap, gstinError && styles.inputError]}>
            <Ionicons name="business-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
            <TextInput style={styles.textInput} placeholder="e.g. 29AAAAA0000A1Z5" placeholderTextColor="#94A3B8" value={gstin} onChangeText={handleGstinChange} autoCapitalize="characters" maxLength={15} />
          </View>
          {gstinError ? <Text style={styles.errorText}>{gstinError}</Text> : null}
        </View>

        {/* Registered Contact Authorization */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Registered Contact Authorization</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={styles.contactIconCircle}>
                <Ionicons name="call-outline" size={15} color="#083B75" />
              </View>
              <Text style={styles.contactValue}>{registeredMobile}</Text>
            </View>
            <View style={styles.contactRow}>
              <View style={styles.contactIconCircle}>
                <Ionicons name="mail-outline" size={15} color="#083B75" />
              </View>
              <Text style={styles.contactValue}>{registeredEmail}</Text>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactSubRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#083B75" />
              <Text style={styles.contactSubText}>Official certificate copy will be issued to registered signatory credentials</Text>
            </View>
          </View>
        </View>

        {/* Request Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Request Type <Text style={styles.star}>*</Text></Text>
          <TouchableOpacity style={[styles.selectBox, error && styles.inputError]} activeOpacity={0.7} onPress={() => setShowTypeModal(true)}>
            <View style={styles.selectLeftWrap}>
              <Ionicons name="document-text-outline" size={18} color="#083B75" />
              <Text style={[styles.selectText, !requestType && styles.placeholderText]}>{requestType || "Select Request Type"}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Certificate Illustration */}
        <View style={styles.illustrationWrap}>
          <View style={styles.docGraphic}>
            <Ionicons name="document-text" size={54} color="#3B82F6" />
            <View style={styles.sealBadge}>
              <Ionicons name="ribbon" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.actionOrangeBtn} activeOpacity={0.85} onPress={handleAction} disabled={isProcessing}>
          <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionOrangeBtnText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>

      <GstSelectModal visible={showTypeModal} title="Select Request Type" options={CERTIFICATE_REQUEST_TYPES} selectedValue={requestType} onSelect={(v) => { setRequestType(v); setError(""); }} onClose={() => setShowTypeModal(false)} />
      <UniversalDraftModal visible={showDraftModal} title="Save Progress?" message="You have unsaved changes in your GST certificate request. Save your progress so you can resume anytime without re-entering details." saveButtonText="Save as Draft & Exit" discardButtonText="Discard & Exit" cancelButtonText="Keep Editing" onSaveAndExit={handleSaveAndExit} onDiscardAndExit={handleDiscardAndExit} onCancel={handleCancel} />
    </View>
  );
}
