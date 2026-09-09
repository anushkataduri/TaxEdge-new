import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../shared/hooks/useTheme";
import { BrandColors } from "../../../shared/theme";

export interface SelectorOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  isDestructive?: boolean;
}

export interface BottomSheetSelectorProps {
  visible: boolean;
  title: string;
  options: SelectorOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  showCancel?: boolean;
  cancelText?: string;
}

export const BottomSheetSelector: React.FC<BottomSheetSelectorProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  showCancel = true,
  cancelText = "Cancel",
}) => {
  const { isDark, colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderTopColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleWrap}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? "#475569" : "#CBD5E1" },
                  ]}
                />
              </View>

              {/* Title Bar */}
              <View style={styles.header}>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                >
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.closeBtn}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? "#94A3B8" : "#64748B"}
                  />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.scrollList}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option, index) => {
                  const isSelected = selectedValue === option.value;
                  const isDestructive = option.isDestructive;

                  return (
                    <TouchableOpacity
                      key={`${option.value}-${index}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelect(option.value);
                        onClose();
                      }}
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? "rgba(11, 94, 215, 0.15)"
                              : "#EAF1FE"
                            : "transparent",
                          borderColor: isSelected
                            ? BrandColors.PRIMARY_BLUE_ACCENT
                            : isDark
                            ? "#334155"
                            : "#F1F5F9",
                        },
                      ]}
                    >
                      <View style={styles.optionLeft}>
                        {option.icon && (
                          <View
                            style={[
                              styles.iconBox,
                              {
                                backgroundColor: isSelected
                                  ? BrandColors.PRIMARY_BLUE_ACCENT
                                  : isDark
                                  ? "#334155"
                                  : "#F8FAFC",
                              },
                            ]}
                          >
                            <Ionicons
                              name={option.icon}
                              size={18}
                              color={
                                isSelected
                                  ? "#FFFFFF"
                                  : isDestructive
                                  ? "#EF4444"
                                  : isDark
                                  ? "#94A3B8"
                                  : "#083B75"
                              }
                            />
                          </View>
                        )}
                        <View style={styles.textWrap}>
                          <Text
                            style={[
                              styles.optionLabel,
                              {
                                color: isDestructive
                                  ? "#EF4444"
                                  : isSelected
                                  ? BrandColors.PRIMARY_BLUE_ACCENT
                                  : isDark
                                  ? "#F1F5F9"
                                  : "#1E293B",
                                fontWeight: isSelected ? "700" : "500",
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                          {option.subtitle && (
                            <Text
                              style={[
                                styles.optionSubtitle,
                                { color: isDark ? "#94A3B8" : "#64748B" },
                              ]}
                            >
                              {option.subtitle}
                            </Text>
                          )}
                        </View>
                      </View>

                      {isSelected ? (
                        <View style={styles.checkCircle}>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.emptyCircle,
                            { borderColor: isDark ? "#475569" : "#CBD5E1" },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Cancel Button */}
              {showCancel && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[
                    styles.cancelBtn,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      { color: isDark ? "#CBD5E1" : "#475569" },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 36, android: 24, default: 20 }),
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  scrollList: {
    marginBottom: 12,
  },
  scrollContent: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BrandColors.PRIMARY_BLUE_ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
