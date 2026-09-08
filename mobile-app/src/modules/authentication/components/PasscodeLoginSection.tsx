import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/use-theme";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/components/Button/PrimaryButton";

interface PasscodeLoginSectionProps {
  passcode: string;
  onChangePasscode: (code: string) => void;
  onLogin: () => void;
  onForgotPasscode: () => void;
  loading: boolean;
  error?: string | null;
}

export function PasscodeLoginSection({
  passcode,
  onChangePasscode,
  onLogin,
  onForgotPasscode,
  loading,
  error,
}: PasscodeLoginSectionProps) {
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
    onChangePasscode(clean);
    if (clean.length === 6) {
      setTimeout(() => {
        onLogin();
      }, 50);
    }
  };

  const renderDots = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const isFilled = i < passcode.length;
      const isCurrent = i === passcode.length;
      return (
        <View
          key={i}
          style={[
            styles.dotBox,
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
          {isFilled ? <View style={styles.dot} /> : null}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Enter 6-Digit Passcode</Text>
      </View>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={styles.touchable}
      >
        <View style={styles.dotsRow}>{renderDots()}</View>
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        value={passcode}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        style={styles.hiddenInput}
      />

      <View style={styles.forgotRow}>
        <TouchableOpacity onPress={onForgotPasscode} activeOpacity={0.7} style={styles.forgotBtn}>
          <Text style={[styles.forgotText, { color: BrandColors.PRIMARY_BLUE }]}>
            Forgot Passcode?
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <PrimaryButton
        title="Login"
        onPress={onLogin}
        loading={loading}
        disabled={loading || passcode.length !== 6}
        colorType="orange"
        style={styles.loginBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: Spacing.md,
  },
  headerRow: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
  },
  touchable: {
    width: "100%",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    width: "100%",
  },
  dotBox: {
    width: 46,
    height: 54,
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0C2340",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  forgotRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.md,
  },
  forgotBtn: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  error: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 8,
    fontWeight: Typography.fontWeight.semiBold,
  },
  loginBtn: {
    marginTop: 4,
    height: 50,
  },
});

export default PasscodeLoginSection;
