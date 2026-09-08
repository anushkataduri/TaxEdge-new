import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/use-theme";
import { Spacing, BorderRadius, Typography } from "../../../shared/theme";
import { useAuthStore } from "../store/authStore";
import {
  MobileNumberSection,
  OTPSection,
  PasscodeLoginSection,
  ResetPasscodeSection,
  GoogleLoginSection,
  ErrorBanner,
} from "../components";

const HEADER_OFFSET = Spacing.md;
const FOOTER_OFFSET = Spacing.base;
const MIN_SCROLL_PADDING = Spacing.xl + Spacing.xs;

export function AuthenticationScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    isLoggedIn,
    authFlowState,
    mobileNumber,
    otp,
    passcode,
    confirmPasscode,
    isLoading,
    error,
    otpTimer,
    canResendOTP,
    setMobileNumber,
    setOtp,
    setPasscode,
    setConfirmPasscode,
    setError,
    decrementTimer,
    sendOtp,
    verifyOtp,
    loginWithPasscode,
    startForgotPasscode,
    verifyForgotPasscodeOtp,
    resetPasscodeAndProceed,
    resendOtp,
    changeNumber,
    setAuthFlowState,
  } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(main)/home" as any);
    }
  }, [isLoggedIn]);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const isOtpActive =
      authFlowState === "OTP_VERIFICATION" || authFlowState === "FORGOT_PASSCODE_OTP";
    if (isOtpActive && otpTimer > 0) {
      interval = setInterval(() => {
        decrementTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authFlowState, otpTimer]);

  // Animate on state transition
  useEffect(() => {
    fadeAnim.setValue(0.3);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [authFlowState]);

  // Subtitle per state
  const getSubTitle = () => {
    switch (authFlowState) {
      case "ENTER_MOBILE":
      case "OTP_VERIFICATION":
        return "Login to continue with TaxEdge";
      case "PASSCODE_LOGIN":
        return "Enter your passcode to sign in";
      case "FORGOT_PASSCODE_OTP":
        return "Verify your mobile number to reset passcode";
      case "RESET_PASSCODE":
        return "Set your new 6-digit login passcode";
      default:
        return "Login to continue with TaxEdge";
    }
  };

  const handleMobileSubmit = async () => {
    await sendOtp();
  };

  const handleOtpVerify = async (code?: string) => {
    const res = await verifyOtp(code);
    if (res.success && !res.isExistingUser) {
      // New user -> navigate to original TaxEdge registration form
      router.push("/(auth)/createprofile" as any);
    }
  };

  const handleLoginSubmit = async () => {
    const res = await loginWithPasscode();
    if (res.success) {
      router.replace("/(main)/home" as any);
    }
  };

  const handleForgotPasscode = async () => {
    await startForgotPasscode();
  };

  const handleForgotPasscodeOtpVerify = async (code?: string) => {
    await verifyForgotPasscodeOtp(code);
  };

  const handleResetPasscodeSubmit = async () => {
    await resetPasscodeAndProceed();
  };

  const isMobileReadOnly = authFlowState !== "ENTER_MOBILE";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Math.max(insets.top + HEADER_OFFSET, MIN_SCROLL_PADDING),
            paddingBottom: Math.max(insets.bottom + FOOTER_OFFSET, MIN_SCROLL_PADDING),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Header & Branding */}
          <View style={styles.header}>
            <Image
              source={require("../../../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.brandTitle, { color: colors.primaryDark }]}>TAXEDGE</Text>
            <Text style={[styles.brandSub, { color: colors.textSecondary }]}>FIN SOLUTIONS</Text>
          </View>

          {/* Welcome Title */}
          <View style={styles.welcome}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome Back 👋</Text>
            <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
              {getSubTitle()}
            </Text>
          </View>

          {/* Error Banner */}
          <ErrorBanner error={error} onDismiss={() => setError(null)} />

          {/* Form Body with Animated Transition */}
          <Animated.View
            style={[
              styles.formBody,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* 1. ENTER_MOBILE or OTP_VERIFICATION */}
            {(authFlowState === "ENTER_MOBILE" || authFlowState === "OTP_VERIFICATION") && (
              <>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={handleMobileSubmit}
                  isReadOnly={isMobileReadOnly}
                  onChangeNumber={changeNumber}
                  loading={isLoading && authFlowState === "ENTER_MOBILE"}
                  showContinueButton={authFlowState === "ENTER_MOBILE"}
                />

                {authFlowState === "OTP_VERIFICATION" && (
                  <OTPSection
                    otp={otp}
                    onChangeOtp={setOtp}
                    onVerify={handleOtpVerify}
                    onResend={resendOtp}
                    timer={otpTimer}
                    canResend={canResendOTP}
                    loading={isLoading}
                    verifyButtonTitle="Verify OTP"
                  />
                )}

                <GoogleLoginSection disabled={isLoading} />
              </>
            )}

            {/* 2. PASSCODE_LOGIN (Existing User) */}
            {authFlowState === "PASSCODE_LOGIN" && (
              <>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={() => {}}
                  isReadOnly={true}
                  onChangeNumber={changeNumber}
                  loading={false}
                  showContinueButton={false}
                />

                <PasscodeLoginSection
                  passcode={passcode}
                  onChangePasscode={setPasscode}
                  onLogin={handleLoginSubmit}
                  onForgotPasscode={handleForgotPasscode}
                  loading={isLoading}
                />

                <GoogleLoginSection disabled={isLoading} />
              </>
            )}

            {/* 3. FORGOT_PASSCODE_OTP */}
            {authFlowState === "FORGOT_PASSCODE_OTP" && (
              <>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={() => {}}
                  isReadOnly={true}
                  onChangeNumber={() => setAuthFlowState("PASSCODE_LOGIN")}
                  loading={false}
                  showContinueButton={false}
                />

                <OTPSection
                  otp={otp}
                  onChangeOtp={setOtp}
                  onVerify={handleForgotPasscodeOtpVerify}
                  onResend={resendOtp}
                  timer={otpTimer}
                  canResend={canResendOTP}
                  loading={isLoading}
                  verifyButtonTitle="Verify Reset Code"
                />
              </>
            )}

            {/* 4. RESET_PASSCODE */}
            {authFlowState === "RESET_PASSCODE" && (
              <ResetPasscodeSection
                passcode={passcode}
                confirmPasscode={confirmPasscode}
                onChangePasscode={setPasscode}
                onChangeConfirmPasscode={setConfirmPasscode}
                onSubmit={handleResetPasscodeSubmit}
                onBack={() => setAuthFlowState("PASSCODE_LOGIN")}
                title="Create New Passcode"
                subtitle="Enter and confirm your new 6-digit passcode"
                submitButtonTitle="Reset Passcode"
                loading={isLoading}
              />
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  wrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 3.5,
    marginTop: 3,
  },
  welcome: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 20,
  },
  formBody: {
    width: "100%",
  },
});

export default AuthenticationScreen;
