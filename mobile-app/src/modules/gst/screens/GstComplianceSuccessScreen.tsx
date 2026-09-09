import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Sharing from "expo-sharing";
import { useTheme } from "../../../shared/hooks/useTheme";
import { BrandColors } from "../../../shared/theme";

export function GstComplianceSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const params = useLocalSearchParams<{
    referenceId?: string;
    requestType?: string;
    gstin?: string;
    submittedAt?: string;
    estimatedResponse?: string;
  }>();

  const refId = params.referenceId || "GSTC-2026-000123";
  const requestType = params.requestType || "Compliance Request";
  const gstin = params.gstin || "29AAAAA0000A1Z5";
  const submittedAt = params.submittedAt || "09 Sep 2026";
  const estimatedResponse = params.estimatedResponse || "Within 24 Hours";

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCopyRef = () => {
    Alert.alert("Reference ID Copied", `Reference ID ${refId} has been copied.`);
  };

  const handleGoDashboard = () => {
    router.replace("/(main)/home" as any);
  };

  const handleTrackRequest = () => {
    router.replace("/(main)/applications" as any);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Checkmark Circle */}
        <Animated.View
          style={[
            styles.checkCircleWrap,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.outerGlow}>
            <View style={styles.middleCircle}>
              <View style={styles.innerCheckCircle}>
                <Ionicons name="checkmark" size={44} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Title & Subtitle */}
        <Animated.View
          style={[
            styles.headerCol,
            {
              transform: [{ translateY: cardSlideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.successTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Request Submitted Successfully
          </Text>

          <Text
            style={[
              styles.successSubtitle,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            Your GST Compliance request has been submitted successfully.
            Our CA team will review your documents and contact you shortly.
          </Text>
        </Animated.View>

        {/* Reference ID Card */}
        <Animated.View
          style={[
            styles.refCard,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              transform: [{ translateY: cardSlideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.refRow}>
            <View>
              <Text
                style={[
                  styles.refLabel,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                Reference ID
              </Text>
              <Text
                style={[
                  styles.refValue,
                  { color: BrandColors.PRIMARY_BLUE_ACCENT },
                ]}
              >
                {refId}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyRef}
              style={[
                styles.copyButton,
                {
                  backgroundColor: isDark ? "#334155" : "#EAF1FE",
                },
              ]}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color={BrandColors.PRIMARY_BLUE_ACCENT}
              />
              <Text
                style={[
                  styles.copyText,
                  { color: BrandColors.PRIMARY_BLUE_ACCENT },
                ]}
              >
                Copy
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
            ]}
          />

          {/* Key Details Grid */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                Submitted On
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#F1F5F9" : "#1E293B" },
                ]}
              >
                {submittedAt}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                Estimated Response
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#38BDF8" : "#083B75" },
                ]}
              >
                {estimatedResponse}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
            ]}
          />

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                Request Type
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#F1F5F9" : "#1E293B" },
                ]}
              >
                {requestType}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                GSTIN
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#F1F5F9" : "#1E293B" },
                ]}
              >
                {gstin}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* What Happens Next Card */}
        <Animated.View
          style={[
            styles.nextStepsCard,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              transform: [{ translateY: cardSlideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.nextStepsTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            What happens next?
          </Text>

          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text
              style={[
                styles.stepText,
                { color: isDark ? "#CBD5E1" : "#475569" },
              ]}
            >
              A certified Chartered Accountant will review your uploaded registers and notice details.
            </Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text
              style={[
                styles.stepText,
                { color: isDark ? "#CBD5E1" : "#475569" },
              ]}
            >
              You will receive an update in your TaxEdge Notifications and WhatsApp within 24 hours.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTrackRequest}
          style={styles.primaryBtn}
        >
          <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Track Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGoDashboard}
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#CBD5E1",
            },
          ]}
        >
          <Ionicons
            name="home-outline"
            size={18}
            color={isDark ? "#F8FAFC" : "#0F172A"}
          />
          <Text
            style={[
              styles.secondaryBtnText,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Go to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  checkCircleWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  outerGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(22, 163, 74, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCheckCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  headerCol: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  refCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  refValue: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  copyText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    gap: 3,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  nextStepsCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  nextStepsTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    marginTop: 6,
  },
  stepText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    width: "100%",
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
