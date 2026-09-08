import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/use-theme";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/components/Button/PrimaryButton";

interface ResetPasscodeSectionProps {
  passcode: string;
  confirmPasscode: string;
  onChangePasscode: (p: string) => void;
  onChangeConfirmPasscode: (cp: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  submitButtonTitle?: string;
  loading: boolean;
  error?: string | null;
}

export function ResetPasscodeSection({
  passcode,
  confirmPasscode,
  onChangePasscode,
  onChangeConfirmPasscode,
  onSubmit,
  onBack,
  title = "Create New Passcode",
  subtitle = "Set a secure 6-digit numeric passcode to protect your account",
  submitButtonTitle = "Save & Continue",
  loading,
  error,
}: ResetPasscodeSectionProps) {
  const colors = useTheme();
  const [focusedField, setFocusedField] = useState<"passcode" | "confirm" | null>(null);

  const isFormValid =
    passcode.length === 6 && confirmPasscode.length === 6 && passcode === confirmPasscode;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        {onBack ? (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Passcode Input */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>6-Digit Passcode</Text>
        <TextInput
          value={passcode}
          onChangeText={(t) => onChangePasscode(t.replace(/\D/g, ""))}
          onFocus={() => setFocusedField("passcode")}
          onBlur={() => setFocusedField(null)}
          placeholder="Enter 6 digits"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.backgroundElement,
              borderColor:
                focusedField === "passcode" ? BrandColors.PRIMARY_BLUE : colors.border,
            },
          ]}
        />
      </View>

      {/* Confirm Passcode Input */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm Passcode</Text>
        <TextInput
          value={confirmPasscode}
          onChangeText={(t) => onChangeConfirmPasscode(t.replace(/\D/g, ""))}
          onFocus={() => setFocusedField("confirm")}
          onBlur={() => setFocusedField(null)}
          placeholder="Re-enter 6 digits"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.backgroundElement,
              borderColor:
                focusedField === "confirm" ? BrandColors.PRIMARY_BLUE : colors.border,
            },
          ]}
        />
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <PrimaryButton
        title={submitButtonTitle}
        onPress={onSubmit}
        loading={loading}
        disabled={loading || !isFormValid}
        colorType="orange"
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs + 1,
    marginTop: 2,
    lineHeight: 18,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    paddingHorizontal: Spacing.base - 2,
    fontSize: Typography.fontSize.lg,
    letterSpacing: 6,
  },
  error: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 10,
    fontWeight: Typography.fontWeight.semiBold,
  },
  submitBtn: {
    marginTop: 10,
    height: 50,
  },
});

export default ResetPasscodeSection;
