
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  type TextInputProps,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../hooks/use-theme";
import { BrandColors, Colors, BorderWidth, Spacing } from "../../shared/theme";
import { useAuthStore } from "../../store/authStore";
import { styles } from "../../styles/app/(auth)/create-profile.styles";
import type { IconName, ProfileFormValues } from "../../types/domain";

const HEADER_INSET_TOP_OFFSET = Spacing.sm; // 8
const MIN_HEADER_TOP = Spacing.xl; // 24

/**
 * The signup form: the customer profile fields plus the credentials collected
 * on this screen. `password` and `confirmPassword` stay local - they are not
 * part of CustomerProfile and are never written to the store.
 */
interface SignupForm extends ProfileFormValues {
  customerType: string;
  password: string;
  confirmPassword: string;
}

type SignupErrors = Partial<Record<keyof SignupForm, string>>;

export default function CreateProfileScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuthStore();

  // Profile states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(false);
  const [pickerYear, setPickerYear] = useState(2000);
  const [pickerMonth, setPickerMonth] = useState(0);
  const [pickerDay, setPickerDay] = useState(1);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const CUSTOMER_TYPES = [
    "Individual",
    "Salaried",
    "Business",
    "Proprietorship",
    "Partnership",
    "LLP",
    "Private Limited",
    "Company",
    "Freelancer / Consultant",
  ];

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    customerType: "",
    password: "",
    confirmPassword: "",
    dob: "",
    pan: "",
    aadhaar: "",
    address: "",
  });


  const validateField = (key: keyof SignupForm, val: string): string => {
    switch (key) {
      case "name":
        return val.trim() ? "" : "Full name is required";
      case "email": {
        const clean = val.trim();
        if (!clean) return "Email ID is required";
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean)) {
          return "Enter a valid email address";
        }
        return "";
      }
      case "pan": {
        const clean = val.trim().toUpperCase();
        if (!clean) return "PAN number is required";
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) {
          return "Enter a valid 10-digit PAN (e.g. ABCDE1234F)";
        }
        return "";
      }
      case "aadhaar": {
        const clean = val.replace(/\D/g, "");
        if (!clean) return "Aadhaar number is required";
        if (clean.length !== 12 || !/^[2-9]{1}[0-9]{11}$/.test(clean)) {
          return "Enter a valid 12-digit Aadhaar number";
        }
        return "";
      }
      case "customerType":
        return val ? "" : "Account type is required";
      case "address":
        return val.trim() ? "" : "Address is required";
      case "password": {
        if (!val) return "6-digit passcode is required";
        if (!/^\d{6}$/.test(val)) return "Passcode must be exactly 6 numeric digits";
        return "";
      }
      case "confirmPassword": {
        if (!val) return "Confirm passcode is required";
        if (val !== form.password) return "Passcodes do not match";
        return "";
      }
      case "dob":
        return val.trim() ? "" : "Date of birth is required";
      default:
        return "";
    }
  };

  const updateForm = (key: keyof SignupForm, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));

    if (key === "pan") {
      const clean = val.trim().toUpperCase();
      if (clean.length === 10) {
        setProfileErrors((p) => ({
          ...p,
          pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)
            ? ""
            : "Enter a valid 10-digit PAN (e.g. ABCDE1234F)",
        }));
      } else if (profileErrors.pan && clean.length < 10) {
        setProfileErrors((p) => ({ ...p, pan: "" }));
      }
    } else if (key === "aadhaar") {
      const clean = val.replace(/\D/g, "");
      if (clean.length === 12) {
        setProfileErrors((p) => ({
          ...p,
          aadhaar: /^[2-9]{1}[0-9]{11}$/.test(clean)
            ? ""
            : "Enter a valid 12-digit Aadhaar number",
        }));
      } else if (profileErrors.aadhaar && clean.length < 12) {
        setProfileErrors((p) => ({ ...p, aadhaar: "" }));
      }
    } else if (key === "email") {
      if (
        profileErrors.email &&
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim())
      ) {
        setProfileErrors((p) => ({ ...p, email: "" }));
      }
    } else if (key === "password") {
      if (val.length === 6 && profileErrors.password) {
        setProfileErrors((p) => ({ ...p, password: "" }));
      }
      if (form.confirmPassword) {
        setProfileErrors((p) => ({
          ...p,
          confirmPassword: val === form.confirmPassword ? "" : "Passcodes do not match",
        }));
      }
    } else if (key === "confirmPassword") {
      if (val.length === 6 || val === form.password) {
        setProfileErrors((p) => ({
          ...p,
          confirmPassword: val === form.password ? "" : "Passcodes do not match",
        }));
      }
    } else if (profileErrors[key]) {
      setProfileErrors((p) => ({ ...p, [key]: "" }));
    }
  };

  const handleBlur = (key: keyof SignupForm) => {
    const val = form[key];
    if (val && val.trim().length > 0) {
      const err = validateField(key, val);
      if (err) {
        setProfileErrors((p) => ({ ...p, [key]: err }));
      }
    }
  };

  const handleDobChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
    updateForm("dob", formatted);
  };

  const openCalendarModal = () => {
    if (form.dob) {
      const parts = form.dob.split("-");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y >= 1930 && y <= 2030) {
          setPickerDay(d);
          setPickerMonth(m);
          setPickerYear(y);
        }
      }
    }
    setShowDatePicker(true);
  };

  const confirmCalendarDate = () => {
    const dayStr = String(pickerDay).padStart(2, "0");
    const monthStr = String(pickerMonth + 1).padStart(2, "0");
    const yearStr = String(pickerYear);
    updateForm("dob", `${dayStr}-${monthStr}-${yearStr}`);
    setShowDatePicker(false);
  };

  const handleCreateProfile = async () => {
    const errs: SignupErrors = {};

    (Object.keys(form) as (keyof SignupForm)[]).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) errs[key] = err;
    });

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return Alert.alert("Incomplete Form", "Please fill in all required fields.");
    }

    setProfileLoading(true);
    try {
      const res = await register(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          customerType: form.customerType,
          dob: form.dob.trim(),
          pan: form.pan.trim().toUpperCase(),
          aadhaar: form.aadhaar.replace(/\D/g, ""),
          address: form.address.trim(),
        },
        form.password.trim(),
        true
      );

      setProfileLoading(false);
      if (res.success) {
        router.replace("/(main)/home" as any);
      } else {
        Alert.alert("Registration Error", res.error || "Failed to create account.");
      }
    } catch (err) {
      setProfileLoading(false);
      Alert.alert("Registration Error", "An unexpected error occurred.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={[styles.container, { backgroundColor: BrandColors.BACKGROUND }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.profileScroll,
          { paddingBottom: Math.max(insets.bottom + Spacing.base, Spacing.lg) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Top Wave Header */}
        <View style={styles.waveHeaderWrapper}>
          <Svg
            height={195}
            width="100%"
            viewBox="0 0 375 195"
            style={StyleSheet.absoluteFill}
            preserveAspectRatio="none"
          >
            {/* Navy Blue Curved Base */}
            <Path
              d="M0,0 L375,0 L375,130 C310,180 230,175 140,145 C60,118 20,135 0,150 Z"
              fill={BrandColors.PRIMARY_BLUE_DARK}
            />
            {/* Orange Wave on Top Right */}
            <Path
              d="M250,0 C290,40 335,65 375,68 L375,0 Z"
              fill={BrandColors.PRIMARY_ORANGE}
            />
          </Svg>

          {/* Back Arrow & Centered Header Title */}
          <View
            style={[
              styles.waveHeaderContent,
              { paddingTop: Math.max(insets.top + HEADER_INSET_TOP_OFFSET, MIN_HEADER_TOP) },
            ]}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={styles.backBtnWhite}
              >
                <Ionicons name="arrow-back" size={24} color={BrandColors.WHITE} />
              </TouchableOpacity>

              <Text style={styles.headerTitleWhite}>Create Account</Text>
            </View>
          </View>
        </View>

        {/* Form Fields Section */}
        <View style={styles.formSection}>
          {/* 1. Full Name */}
          <Field
            leftIcon="person-outline"
            value={form.name}
            onChangeText={(t) => updateForm("name", t)}
            onBlur={() => handleBlur("name")}
            placeholder="Full Name"
            error={profileErrors.name}
          />

          {/* 2. Email ID */}
          <Field
            leftIcon="mail-outline"
            value={form.email}
            onChangeText={(t) => updateForm("email", t)}
            onBlur={() => handleBlur("email")}
            placeholder="Email ID"
            keyboardType="email-address"
            autoCapitalize="none"
            error={profileErrors.email}
          />

          {/* 3. PAN Number */}
          <Field
            leftIcon="card-outline"
            value={form.pan}
            onChangeText={(t) => updateForm("pan", t.toUpperCase())}
            onBlur={() => handleBlur("pan")}
            placeholder="PAN Number"
            autoCapitalize="characters"
            maxLength={10}
            error={profileErrors.pan}
          />

          {/* 4. Aadhaar Number */}
          <Field
            leftIcon="newspaper-outline"
            value={form.aadhaar}
            onChangeText={(t) => updateForm("aadhaar", t.replace(/\D/g, "").slice(0, 12))}
            onBlur={() => handleBlur("aadhaar")}
            placeholder="Aadhaar Number"
            keyboardType="number-pad"
            maxLength={12}
            error={profileErrors.aadhaar}
          />

          {/* 5. Date of Birth */}
          <Field
            leftIcon="calendar-outline"
            value={form.dob}
            onChangeText={handleDobChange}
            placeholder="Date of Birth (DD-MM-YYYY)"
            keyboardType="number-pad"
            maxLength={10}
            rightIcon="calendar-outline"
            onRightIconPress={openCalendarModal}
            error={profileErrors.dob}
          />

          {/* 6. Customer Type Dropdown */}
          <View style={styles.fieldContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowCustomerTypeModal(true)}
              style={[
                styles.inputBox,
                profileErrors.customerType
                  ? { borderColor: Colors.error, backgroundColor: "#FEF2F2" }
                  : null,
              ]}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={BrandColors.PRIMARY_ORANGE}
                style={styles.leftIcon}
              />
              <Text
                style={[
                  styles.dropdownText,
                  !form.customerType && { color: BrandColors.TEXT_MUTED },
                ]}
              >
                {form.customerType || "Select Account Type"}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCustomerTypeModal(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.rightIconTouch}
              >
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={BrandColors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </TouchableOpacity>
            {profileErrors.customerType ? (
              <Text style={styles.errorText}>{profileErrors.customerType}</Text>
            ) : null}
          </View>

          {/* 7. Current Address */}
          <Field
            leftIcon="location-outline"
            value={form.address}
            onChangeText={(t) => updateForm("address", t)}
            onBlur={() => handleBlur("address")}
            placeholder="Current Address"
            error={profileErrors.address}
          />

          {/* 8. Create Passcode */}
          <Field
            leftIcon="lock-closed-outline"
            value={form.password}
            onChangeText={(t) => updateForm("password", t.replace(/\D/g, "").slice(0, 6))}
            onBlur={() => handleBlur("password")}
            placeholder="Create Passcode"
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPassword((prev) => !prev)}
            error={profileErrors.password}
          />

          {/* 9. Confirm 6-Digit Passcode */}
          <Field
            leftIcon="lock-closed-outline"
            value={form.confirmPassword}
            onChangeText={(t) => updateForm("confirmPassword", t.replace(/\D/g, "").slice(0, 6))}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Confirm 6-Digit Passcode"
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry={!showConfirmPassword}
            rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
            error={profileErrors.confirmPassword}
          />

          {/* Register CTA Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCreateProfile}
            disabled={profileLoading}
            style={styles.submitBtnOrange}
          >
            {profileLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.calendarModalContent,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.calendarHeader}>
              <Text style={[styles.calendarTitle, { color: "#083B75" }]}>
                Select Date of Birth
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Month & Year Bar */}
            <View style={styles.monthYearNav}>
              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 0) {
                    setPickerMonth(11);
                    setPickerYear((y) => y - 1);
                  } else {
                    setPickerMonth((m) => m - 1);
                  }
                }}
                style={styles.navArrow}
              >
                <Ionicons name="chevron-back" size={18} color="#083B75" />
              </TouchableOpacity>

              <View style={styles.monthYearDisplay}>
                <Text style={[styles.monthYearText, { color: "#083B75" }]}>
                  {months[pickerMonth]} {pickerYear}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 11) {
                    setPickerMonth(0);
                    setPickerYear((y) => y + 1);
                  } else {
                    setPickerMonth((m) => m + 1);
                  }
                }}
                style={styles.navArrow}
              >
                <Ionicons name="chevron-forward" size={18} color="#083B75" />
              </TouchableOpacity>
            </View>

            {/* Fast Year Switcher Chips */}
            <View style={styles.yearQuickRow}>
              {[-10, -5, +5, +10].map((offset) => (
                <TouchableOpacity
                  key={offset}
                  onPress={() => setPickerYear((y) => y + offset)}
                  style={styles.yearChip}
                >
                  <Text style={styles.yearChipText}>
                    {offset > 0 ? `+${offset}` : offset} Yrs
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdaysRow}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <Text key={d} style={styles.weekdayText}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {Array.from({
                length: new Date(pickerYear, pickerMonth, 1).getDay(),
              }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCellEmpty} />
              ))}

              {Array.from({
                length: new Date(pickerYear, pickerMonth + 1, 0).getDate(),
              }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = pickerDay === dayNum;
                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    onPress={() => setPickerDay(dayNum)}
                    style={[
                      styles.dayCell,
                      isSelected && {
                        backgroundColor: "#083B75",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        {
                          color: isSelected
                            ? "#FFFFFF"
                            : colors.text,
                        },
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={[
                  styles.modalCancelBtn,
                  { borderColor: "#BFDBFE" },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmCalendarDate}
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: "#F97316" },
                ]}
              >
                <Text style={styles.modalConfirmText}>Apply Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Customer Type Selection Modal */}
      <Modal
        visible={showCustomerTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomerTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customerTypeModalContent}>
            <View style={styles.calendarHeader}>
              <Text style={[styles.calendarTitle, { color: "#00204A" }]}>
                Select Account Type
              </Text>
              <TouchableOpacity
                onPress={() => setShowCustomerTypeModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
            >
              {CUSTOMER_TYPES.map((type) => {
                const isSelected = form.customerType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.7}
                    onPress={() => {
                      updateForm("customerType", type);
                      setShowCustomerTypeModal(false);
                    }}
                    style={[
                      styles.customerTypeOption,
                      isSelected && styles.customerTypeOptionSelected,
                    ]}
                  >
                    <View style={styles.customerTypeOptionLeft}>
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={isSelected ? "#F97316" : "#94A3B8"}
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        style={[
                          styles.customerTypeOptionText,
                          isSelected && styles.customerTypeOptionTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

interface FieldProps
  extends Omit<
    TextInputProps,
    "value" | "onChangeText" | "placeholder" | "style" | "onBlur"
  > {
  label?: string;
  leftIcon?: IconName;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
}

function Field({
  label,
  leftIcon,
  value,
  onChangeText,
  onBlur,
  placeholder,
  rightIcon,
  onRightIconPress,
  error,
  keyboardType,
  maxLength,
  ...props
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputBox,
          error
            ? {
              borderColor: Colors.error,
              backgroundColor: "#FEF2F2",
            }
            : {
              borderColor: isFocused
                ? BrandColors.PRIMARY_ORANGE
                : BrandColors.BORDER,
              backgroundColor: BrandColors.WHITE,
            },
          {
            borderWidth: isFocused || error ? BorderWidth.regular : BorderWidth.thin,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? Colors.error : BrandColors.PRIMARY_ORANGE}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          placeholderTextColor={BrandColors.TEXT_MUTED}
          keyboardType={keyboardType}
          maxLength={maxLength}
          {...props}
        />
        {rightIcon &&
          (onRightIconPress ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.rightIconTouch}
            >
              <Ionicons name={rightIcon} size={20} color={BrandColors.TEXT_SECONDARY} />
            </TouchableOpacity>
          ) : (
            <Ionicons
              name={rightIcon}
              size={18}
              color={BrandColors.TEXT_SECONDARY}
              style={styles.rightIcon}
            />
          ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

