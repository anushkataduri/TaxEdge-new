import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/use-theme";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/components/Button/PrimaryButton";

interface MobileNumberSectionProps {
  mobile: string;
  onChangeMobile: (t: string) => void;
  onSubmit: () => void;
  isReadOnly: boolean;
  onChangeNumber?: () => void;
  loading: boolean;
  error?: string | null;
  showContinueButton?: boolean;
}

export function MobileNumberSection({
  mobile,
  onChangeMobile,
  onSubmit,
  isReadOnly,
  onChangeNumber,
  loading,
  error,
  showContinueButton = true,
}: MobileNumberSectionProps) {
  const colors = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
        {isReadOnly && onChangeNumber ? (
          <TouchableOpacity
            onPress={onChangeNumber}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.changeNumberBtn}
          >
            <Text style={styles.changeNumberText}>Change Number</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.phoneRow, isReadOnly && styles.disabledField]}>
        <View
          style={[
            styles.codeBox,
            {
              borderColor: isFocused && !isReadOnly ? BrandColors.PRIMARY_BLUE : colors.border,
              backgroundColor: colors.backgroundElement,
            },
          ]}
        >
          <Text style={[styles.codeText, { color: isReadOnly ? colors.textSecondary : colors.text }]}>
            +91
          </Text>
        </View>

        <TextInput
          value={mobile}
          editable={!isReadOnly && !loading}
          onChangeText={(t) => onChangeMobile(t.replace(/\D/g, ""))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter 10-digit mobile number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          maxLength={10}
          style={[
            styles.input,
            {
              color: isReadOnly ? colors.textSecondary : colors.text,
              backgroundColor: colors.backgroundElement,
              borderColor: error
                ? colors.error
                : isFocused && !isReadOnly
                ? BrandColors.PRIMARY_BLUE
                : colors.border,
            },
          ]}
        />
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      {showContinueButton ? (
        <PrimaryButton
          title="Continue"
          onPress={onSubmit}
          loading={loading}
          disabled={loading || mobile.length !== 10}
          colorType="orange"
          style={styles.continueBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  changeNumberBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  changeNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  disabledField: {
    opacity: 0.85,
  },
  codeBox: {
    height: 50,
    width: 58,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    justifyContent: "center",
    alignItems: "center",
  },
  codeText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    paddingHorizontal: Spacing.base - 2,
    fontSize: Typography.fontSize.md,
  },
  error: {
    fontSize: Typography.fontSize.sm + 0.5,
    marginTop: 6,
    fontWeight: Typography.fontWeight.semiBold,
  },
  continueBtn: {
    marginTop: 18,
    height: 50,
  },
});

export default MobileNumberSection;
