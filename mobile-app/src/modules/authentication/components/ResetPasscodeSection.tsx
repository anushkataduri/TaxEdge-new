import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  useColorScheme,
} from "react-native";
import {
  BrandColors,
  BorderRadius,
  Typography,
  Spacing,
  BorderWidth,
} from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/components/Button/PrimaryButton";
import { validatePasscode } from "../validation/authSchema";
import { useAuthStore } from "../store/authStore";

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
  mobileNumber?: string;
}

export function ResetPasscodeSection({
  passcode,
  confirmPasscode,
  onChangePasscode,
  onChangeConfirmPasscode,
  onSubmit,
  loading,
  error,
  mobileNumber,
}: ResetPasscodeSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const titleColor = isDark ? "#FFFFFF" : "#06152D";

  const storeMobileNumber = useAuthStore((state) => state.mobileNumber);
  const effectiveMobileNumber = mobileNumber || storeMobileNumber;

  const newPasscodeRef = useRef<TextInput>(null);
  const confirmPasscodeRef = useRef<TextInput>(null);
  const [activeSection, setActiveSection] = useState<"new" | "confirm">("new");

  useEffect(() => {
    const t = setTimeout(() => {
      newPasscodeRef.current?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const handleNewPasscodeChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    onChangePasscode(clean);
    if (clean.length === 6) {
      const v = validatePasscode(clean, effectiveMobileNumber);
      if (v.valid) {
        setTimeout(() => {
          confirmPasscodeRef.current?.focus();
          setActiveSection("confirm");
        }, 50);
      }
    }
  };

  const handleConfirmPasscodeChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    onChangeConfirmPasscode(clean);
    if (clean.length === 6 && passcode === clean) {
      Keyboard.dismiss();
    }
  };

  const isPasscodeComplete = passcode.length === 6;
  const isConfirmComplete = confirmPasscode.length === 6;
  const passcodeValidation = isPasscodeComplete
    ? validatePasscode(passcode, effectiveMobileNumber)
    : { valid: true };
  const isPasscodeValid = isPasscodeComplete && passcodeValidation.valid;
  const doPasscodesMatch = passcode === confirmPasscode;

  const isFormValid = isPasscodeValid && isConfirmComplete && doPasscodesMatch;
  const showPasscodeError = isPasscodeComplete && !passcodeValidation.valid;
  const showMismatchError = isPasscodeValid && isConfirmComplete && !doPasscodesMatch;

  const renderBoxes = (
    value: string,
    isActive: boolean,
    hasError: boolean,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={styles.otpTouchable}
      >
        <View style={styles.otpGrid}>
          {Array.from({ length: 6 }).map((_, i) => {
            const isFilled = i < value.length;
            const isCurrent = isActive && i === value.length;

            const borderColor = hasError
              ? "#DC2626"
              : isCurrent
              ? BrandColors.PRIMARY_ORANGE
              : isFilled
              ? (isDark ? "#38BDF8" : BrandColors.PRIMARY_BLUE_DARK)
              : (isDark ? "#334155" : "#E2E8F0");

            const backgroundColor = isDark
              ? (isCurrent || isFilled ? "#1E293B" : "#0F172A")
              : BrandColors.WHITE;

            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  {
                    borderColor,
                    borderWidth:
                      isCurrent || isFilled ? BorderWidth.medium : BorderWidth.thin,
                    backgroundColor,
                  },
                ]}
              >
                {isFilled ? (
                  <View
                    style={[
                      styles.secureDot,
                      {
                        backgroundColor: isDark
                          ? BrandColors.WHITE
                          : BrandColors.PRIMARY_BLUE_DARK,
                      },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. New Passcode Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          New Passcode
        </Text>
        {renderBoxes(passcode, activeSection === "new", showPasscodeError, () => {
          newPasscodeRef.current?.focus();
          setActiveSection("new");
        })}
      </View>

      {/* 2. Confirm Passcode Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          Confirm Passcode
        </Text>
        {renderBoxes(
          confirmPasscode,
          activeSection === "confirm",
          showMismatchError,
          () => {
            confirmPasscodeRef.current?.focus();
            setActiveSection("confirm");
          }
        )}
      </View>

      {/* Hidden Inputs for keyboard management */}
      <TextInput
        ref={newPasscodeRef}
        value={passcode}
        onChangeText={handleNewPasscodeChange}
        onFocus={() => setActiveSection("new")}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        style={styles.hiddenInput}
      />

      <TextInput
        ref={confirmPasscodeRef}
        value={confirmPasscode}
        onChangeText={handleConfirmPasscodeChange}
        onFocus={() => setActiveSection("confirm")}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        style={styles.hiddenInput}
      />

      {/* Inline Validation Error Message */}
      {showPasscodeError ? (
        <Text style={styles.inlineErrorText}>{passcodeValidation.error}</Text>
      ) : showMismatchError ? (
        <Text style={styles.inlineErrorText}>Passcodes do not match.</Text>
      ) : error ? (
        <Text style={styles.inlineErrorText}>{error}</Text>
      ) : null}

      {/* Reset Passcode Button */}
      <PrimaryButton
        title="Reset Passcode"
        onPress={onSubmit}
        loading={loading}
        disabled={!isFormValid || loading}
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
  section: {
    marginBottom: Spacing.xl,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm + 4,
    textAlign: "left",
  },
  otpTouchable: {
    width: "100%",
  },
  otpGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: BorderRadius.base - 2,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  secureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  inlineErrorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.sm,
    height: 54,
    borderRadius: BorderRadius.base - 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
});

export default ResetPasscodeSection;
