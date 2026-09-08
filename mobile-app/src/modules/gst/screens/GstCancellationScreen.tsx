import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../shared/theme";
import { GstServiceBanner } from "../components/common/GstServiceBanner";
import { GstSelectModal } from "../components/common/GstSelectModal";
import { GstDatePickerModal } from "../components/common/GstDatePickerModal";
import { GstCancellationConfirmModal } from "../components/cancellation/GstCancellationConfirmModal";
import { GstSuccessAnimationScreen } from "../components/common/GstSuccessAnimationScreen";
import { UniversalDraftModal } from "../../../shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "../../../shared/hooks/useUniversalDraftGuard";
import { GstValidators } from "../utils/gstValidators";
import { styles } from "./GstCancellationScreen.styles";
import { useApplicationStore } from "../../../store/applicationStore";
import { useNotificationStore } from "../../../store/notificationStore";

const CANCELLATION_REASONS = [
  "Discontinuance / Closure of Business",
  "Annual Turnover Fell Below GST Exemption Limit (₹40L/₹20L)",
  "Transfer of Business / Demerger / Amalgamation",
  "Death of Sole Proprietor",
  "Change in Legal Constitution",
  "Other Valid Reason",
];

export default function GstCancellationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [gstin, setGstin] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancellationDate, setCancellationDate] = useState("");
  const [closingStock, setClosingStock] = useState("");
  const [pendingLiabilities, setPendingLiabilities] = useState("");
  const [lastGstr3b, setLastGstr3b] = useState("");
  const [isFinalReturnDeclared, setIsFinalReturnDeclared] = useState(false);

  // Modals & UI States
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Universal Draft Guard
  const {
    showDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () =>
      Boolean(
        gstin ||
        reason ||
        cancellationDate ||
        closingStock ||
        lastGstr3b
      ),
    onSaveDraft: () => {
      // Saved
    },
    onDiscardDraft: () => {
      // Discarded
    },
    isSubmitted: () => isSubmitted,
  });

  const clearError = (key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleGstinChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setGstin(cleaned);
    clearError("gstin");
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!GstValidators.isValidGstin(gstin)) {
      errs.gstin = "Enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)";
    }
    if (!reason) errs.reason = "Please select a reason for cancellation.";
    if (reason === "Other Valid Reason" && !GstValidators.isNotEmpty(otherReason, 3)) {
      errs.otherReason = "Please specify the cancellation reason.";
    }
    if (!cancellationDate) errs.cancellationDate = "Cancellation date is required.";
    if (!GstValidators.isNotEmpty(closingStock, 3)) {
      errs.closingStock = "Please enter closing stock details or specify 'Nil'.";
    }
    if (!GstValidators.isNotEmpty(lastGstr3b, 3)) {
      errs.lastGstr3b = "Latest filed GSTR-3B ARN / period reference is required.";
    }
    if (!isFinalReturnDeclared) {
      errs.declaration = "Please confirm the final return filing declaration.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInitialSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Incomplete Details", "Please fill all required fields and check the declaration.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmCancellation = () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      markSubmitted();
      setIsSubmitted(true);

      const appId = useApplicationStore.getState().createApplication(
        "gst-cancellation",
        `GST Cancellation (REG-16)`,
        "GST",
        {
          gstin,
          reason: reason === "Other Valid Reason" ? otherReason : reason,
          cancellationDate,
          closingStock,
          pendingLiabilities,
          lastGstr3b,
        },
        ["Last GSTR-3B Filing Proof", "Closing Stock Valuation"],
        1999
      );

      useNotificationStore.getState().addNotification(
        "Cancellation Request Filed",
        `Your GST Cancellation application for ${gstin} (REG-16) has been submitted. App ID: ${appId}.`,
        "gst"
      );
    }, 800);
  };

  if (isSubmitted) {
    return (
      <GstSuccessAnimationScreen
        title="Cancellation Request Submitted!"
        subtitle={`Your cancellation request for ${gstin} has been submitted successfully.\n\nOur CA will file Form REG-16 on the GST portal.`}
      />
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={BrandColors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GST Cancellation</Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
        {/* Top Info Banner */}
        <GstServiceBanner
          iconName="ban"
          text="Formally surrender and cancel your GST registration via Form REG-16"
        />

        {/* GSTIN (Clean & Editable) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>GSTIN (15-Character) <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.gstin && styles.inputError]}
            placeholder="e.g. 29AAAAA0000A1Z5"
            placeholderTextColor="#94A3B8"
            value={gstin}
            onChangeText={handleGstinChange}
            autoCapitalize="characters"
            maxLength={15}
          />
          {errors.gstin ? <Text style={styles.errorText}>{errors.gstin}</Text> : null}
        </View>

        {/* Reason for Cancellation Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reason for Cancellation <Text style={styles.star}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectBox, errors.reason && styles.inputError]}
            activeOpacity={0.7}
            onPress={() => setShowReasonModal(true)}
          >
            <Text style={[styles.selectText, !reason && styles.placeholderText]}>
              {reason || "Select Reason for Cancellation"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {errors.reason ? <Text style={styles.errorText}>{errors.reason}</Text> : null}
        </View>

        {/* Conditional "Other" input */}
        {reason === "Other Valid Reason" && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Please Specify Reason <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.otherReason && styles.inputError]}
              placeholder="Describe reason for cancelling registration"
              placeholderTextColor="#94A3B8"
              value={otherReason}
              onChangeText={(t) => {
                setOtherReason(t);
                clearError("otherReason");
              }}
            />
            {errors.otherReason ? <Text style={styles.errorText}>{errors.otherReason}</Text> : null}
          </View>
        )}

        {/* Date Cancellation Is Sought */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date Cancellation Is Sought <Text style={styles.star}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectBox, errors.cancellationDate && styles.inputError]}
            activeOpacity={0.7}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={[styles.selectText, !cancellationDate && styles.placeholderText]}>
              {cancellationDate || "Select effective cancellation date"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#083B75" />
          </TouchableOpacity>
          {errors.cancellationDate ? <Text style={styles.errorText}>{errors.cancellationDate}</Text> : null}
        </View>

        {/* Details of Closing Stock */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Details of Closing Stock & Input Tax Reversal <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={[styles.textArea, errors.closingStock && styles.inputError]}
            placeholder="Describe closing inventory value and ITC reversal or enter 'Nil'"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={closingStock}
            onChangeText={(t) => {
              setClosingStock(t);
              clearError("closingStock");
            }}
            maxLength={300}
          />
          <View style={styles.counterRow}>
            {errors.closingStock ? <Text style={styles.errorText}>{errors.closingStock}</Text> : <View />}
            <Text style={styles.charCount}>{closingStock.length}/300</Text>
          </View>
        </View>

        {/* Pending Liabilities (Optional) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Pending Dues / Liabilities (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter any pending GST penalty or tax dues, if any"
            placeholderTextColor="#94A3B8"
            value={pendingLiabilities}
            onChangeText={setPendingLiabilities}
          />
        </View>

        {/* Last GSTR-3B Filed */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last GSTR-3B Filed ARN / Period <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.lastGstr3b && styles.inputError]}
            placeholder="e.g. AA290826000000X / July 2026"
            placeholderTextColor="#94A3B8"
            value={lastGstr3b}
            onChangeText={(t) => {
              setLastGstr3b(t);
              clearError("lastGstr3b");
            }}
          />
          {errors.lastGstr3b ? <Text style={styles.errorText}>{errors.lastGstr3b}</Text> : null}
        </View>

        {/* Final Return Declaration Checkbox */}
        <TouchableOpacity
          style={styles.declarationRow}
          activeOpacity={0.8}
          onPress={() => {
            setIsFinalReturnDeclared(!isFinalReturnDeclared);
            clearError("declaration");
          }}
        >
          <View style={[styles.checkbox, isFinalReturnDeclared && styles.checkboxActive]}>
            {isFinalReturnDeclared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.declarationLabel}>
              Final Return Declaration (GSTR-10) <Text style={styles.star}>*</Text>
            </Text>
            <Text style={styles.declarationSubText}>
              I confirm all outward tax dues are settled and will file final return GSTR-10 within 3 months of cancellation order.
            </Text>
          </View>
        </TouchableOpacity>
        {errors.declaration ? <Text style={styles.errorText}>{errors.declaration}</Text> : null}

        {/* Submit CTA */}
        <TouchableOpacity
          style={styles.actionOrangeBtn}
          activeOpacity={0.85}
          onPress={handleInitialSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.actionOrangeBtnText}>Submit Cancellation Request</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <GstCancellationConfirmModal
        visible={showConfirmModal}
        gstin={gstin || "Your GSTIN"}
        onConfirm={handleConfirmCancellation}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Reason Modal & Date Picker */}
      <GstSelectModal
        visible={showReasonModal}
        title="Select Reason for Cancellation"
        options={CANCELLATION_REASONS}
        selectedValue={reason}
        onSelect={(v) => {
          setReason(v);
          clearError("reason");
        }}
        onClose={() => setShowReasonModal(false)}
      />

      <GstDatePickerModal
        visible={showDateModal}
        title="Date Cancellation Is Sought"
        selectedDate={cancellationDate}
        onSelectDate={(d) => {
          setCancellationDate(d);
          clearError("cancellationDate");
        }}
        onClose={() => setShowDateModal(false)}
      />

      {/* Universal Save As Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Cancellation Draft?"
        message="You have unsaved changes in your GST cancellation request. Save your progress so you can resume anytime without re-entering details."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
}
