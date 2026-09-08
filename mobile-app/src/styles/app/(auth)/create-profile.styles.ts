/**
 * Screen: Create Profile
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
    fontWeight: Typography.fontWeight.medium,
    color: "#DC2626",
  },
  profileScroll: {
    flexGrow: 1,
  },
  waveHeaderWrapper: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  waveHeaderContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 44,
  },
  backBtnWhite: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitleWhite: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extraBold,
    color: BrandColors.WHITE,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  formSection: {
    gap: 2,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.base,
  },
  fieldContainer: {
    marginBottom: Spacing.base - 2,
  },
  label: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 6,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  inputBox: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base - 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    height: "100%",
    color: BrandColors.TEXT_PRIMARY,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  rightIconTouch: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  submitBtnOrange: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    height: 54,
    borderRadius: BorderRadius.base - 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  submitBtnText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg + 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  alreadyText: {
    fontSize: Typography.fontSize.base,
    color: BrandColors.PRIMARY_BLUE_DARK,
    fontWeight: Typography.fontWeight.medium,
  },
  loginLinkText: {
    fontSize: Typography.fontSize.base,
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  dropdownText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: Typography.fontWeight.medium,
  },
  customerTypeModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  customerTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm + 2,
    marginBottom: 4,
  },
  customerTypeOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  customerTypeOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerTypeOptionText: {
    fontSize: Typography.fontSize.md,
    color: "#334155",
    fontWeight: Typography.fontWeight.medium,
  },
  customerTypeOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  selectedBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.PRIMARY_ORANGE_DARK,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  calendarModalContent: {
    width: "100%",
    maxWidth: 360,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  calendarTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  monthYearNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F4FA",
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  navArrow: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#E2EDFB",
  },
  monthYearDisplay: {
    alignItems: "center",
  },
  monthYearText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  yearQuickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 6,
  },
  yearChip: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  yearChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_SECONDARY,
    width: 38,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 18,
  },
  dayCellEmpty: {
    width: "14.28%",
    height: 38,
  },
  dayCell: {
    width: "14.28%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  dayCellText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.WHITE,
  },
  modalCancelText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.WHITE,
  },
});
