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
import { GstFileUploadField } from "../components/common/GstFileUploadField";
import { GstSuccessAnimationScreen } from "../components/common/GstSuccessAnimationScreen";
import { UniversalDraftModal } from "../../../shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "../../../shared/hooks/useUniversalDraftGuard";
import { GstValidators } from "../utils/gstValidators";
import { styles } from "./GstAmendmentScreen.styles";
import { useApplicationStore } from "../../../store/applicationStore";
import { useNotificationStore } from "../../../store/notificationStore";

const AMENDMENT_FIELDS = [
  "Legal Business Name / Trade Name",
  "Principal Place of Business Address",
  "Business Constitution / Type",
  "Bank Account & IFSC Details",
  "Authorized Signatory / Partners / Directors",
  "Additional Place of Business",
];

export default function GstAmendmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [gstin, setGstin] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [supportingDoc, setSupportingDoc] = useState<{ uri: string; name: string; size: string } | null>(null);

  const [showFieldModal, setShowFieldModal] = useState(false);
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
        selectedField ||
        newValue ||
        supportingDoc
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
    if (!selectedField) {
      errs.selectedField = "Please select the field being changed.";
    }
    if (!GstValidators.isNotEmpty(newValue, 2)) {
      errs.newValue = "New value / proposed amendment is required.";
    }
    if (!supportingDoc) {
      errs.supportingDoc = "Please upload proof of amendment (e.g. rent deed, board resolution, bank proof).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Incomplete Details", "Please correct the highlighted errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      markSubmitted();
      setIsSubmitted(true);

      const appId = useApplicationStore.getState().createApplication(
        "gst-amendment",
        `GST Amendment (${selectedField})`,
        "GST",
        {
          gstin,
          selectedField,
          currentValue,
          newValue,
        },
        supportingDoc ? [supportingDoc.name] : ["Supporting Amendment Proof"],
        1499
      );

      useNotificationStore.getState().addNotification(
        "Amendment Request Submitted",
        `Your GST Amendment request for ${gstin} (${selectedField}) has been submitted. App ID: ${appId}.`,
        "gst"
      );
    }, 800);
  };

  if (isSubmitted) {
    return (
      <GstSuccessAnimationScreen
        title="Amendment Submitted!"
        subtitle={`Your amendment request for ${selectedField} on GSTIN ${gstin} has been submitted.\n\nOur CA team will file the REG-14 amendment on the GST portal.`}
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
        <Text style={styles.headerTitle}>GST Amendment</Text>
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
          iconName="pencil"
          text="Update core or non-core fields on your existing GST registration (Form REG-14)"
        />

        {/* GSTIN (Editable & Clean) */}
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

        {/* Field Being Changed Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Field Being Changed <Text style={styles.star}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectBox, errors.selectedField && styles.inputError]}
            activeOpacity={0.7}
            onPress={() => setShowFieldModal(true)}
          >
            <Text style={[styles.selectText, !selectedField && styles.placeholderText]}>
              {selectedField || "Select Field to Amend"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {errors.selectedField ? <Text style={styles.errorText}>{errors.selectedField}</Text> : null}
        </View>

        {/* Current Value (Optional) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current Existing Value (Optional)</Text>
          <TextInput
            style={styles.input}
            value={currentValue}
            onChangeText={setCurrentValue}
            placeholder="Enter current value registered on portal"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* New Value Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New / Proposed Value <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={[styles.textArea, errors.newValue && styles.inputError]}
            placeholder="Enter updated new value in detail"
            placeholderTextColor="#94A3B8"
            value={newValue}
            onChangeText={(t) => {
              setNewValue(t);
              clearError("newValue");
            }}
            multiline
            numberOfLines={4}
            maxLength={250}
          />
          <View style={styles.counterRow}>
            {errors.newValue ? <Text style={styles.errorText}>{errors.newValue}</Text> : <View />}
            <Text style={styles.charCount}>{newValue.length}/250</Text>
          </View>
        </View>

        {/* Supporting Document Upload */}
        <GstFileUploadField
          label="Supporting Proof Document"
          required
          fileUri={supportingDoc?.uri}
          fileName={supportingDoc?.name}
          fileSize={supportingDoc?.size}
          onFileSelected={(uri, name, size) => {
            setSupportingDoc({ uri, name, size });
            clearError("supportingDoc");
          }}
          onFileRemoved={() => setSupportingDoc(null)}
          error={errors.supportingDoc}
          placeholder="Upload Supporting Amendment Proof"
        />

        {/* Submit CTA */}
        <TouchableOpacity
          style={styles.actionOrangeBtn}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.actionOrangeBtnText}>
            {isSubmitting ? "Processing..." : "Submit Amendment Request"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Field Selector Modal */}
      <GstSelectModal
        visible={showFieldModal}
        title="Select Field to Amend"
        options={AMENDMENT_FIELDS}
        selectedValue={selectedField}
        onSelect={(v) => {
          setSelectedField(v);
          clearError("selectedField");
        }}
        onClose={() => setShowFieldModal(false)}
      />

      {/* Universal Save As Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Amendment Draft?"
        message="You have unsaved changes in your GST amendment request. Save your progress so you can resume anytime without re-entering details."
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
