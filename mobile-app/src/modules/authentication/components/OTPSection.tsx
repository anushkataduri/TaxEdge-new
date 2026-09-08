import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/use-theme";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/components/Button/PrimaryButton";

interface OTPSectionProps {
  otp: string;
  onChangeOtp: (text: string) => void;
  onVerify: (code?: string) => void;
  onResend: () => void;
  timer: number;
  canResend: boolean;
  loading: boolean;
  error?: string | null;
  verifyButtonTitle?: string;
}

export function OTPSection({
  otp,
  onChangeOtp,
  onVerify,
  onResend,
  timer,
  canResend,
  loading,
  error,
  verifyButtonTitle = "Verify OTP",
}: OTPSectionProps) {
  const colors = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const handleChangeText = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    onChangeOtp(clean);
  };

  const renderOtpBoxes = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const char = otp[i] || "";
      const isCurrent = i === otp.length;
      return (
        <View
          key={i}
          style={[
            styles.otpBox,
            {
              borderColor: error
                ? colors.error
                : isCurrent
                ? BrandColors.PRIMARY_BLUE
                : colors.border,
              backgroundColor: colors.backgroundElement,
            },
          ]}
        >
          <Text style={[styles.otpBoxText, { color: colors.text }]}>{char}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={styles.otpTouchable}
      >
        <View style={styles.otpGrid}>{renderOtpBoxes()}</View>
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        value={otp}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        style={styles.hiddenInput}
      />

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <PrimaryButton
        title={verifyButtonTitle}
        onPress={() => onVerify(otp)}
        loading={loading}
        disabled={loading || otp.length !== 6}
        colorType="orange"
        style={styles.verifyBtn}
      />

      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>
            Resend code in{" "}
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              0:{timer < 10 ? `0${timer}` : timer}
            </Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={onResend} disabled={!canResend} activeOpacity={0.7}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: Spacing.md,
  },
  otpTouchable: {
    width: "100%",
  },
  otpGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    width: "100%",
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxText: {
    fontSize: Typography.fontSize.lg + 4,
    fontWeight: Typography.fontWeight.bold,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  error: {
    fontSize: Typography.fontSize.sm + 0.5,
    marginBottom: 8,
    fontWeight: Typography.fontWeight.semiBold,
  },
  verifyBtn: {
    marginTop: 4,
    height: 50,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
  },
  resendLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#F97316",
  },
});

export default OTPSection;
