/**
 * Screen: GST Certificate (Styles)
 * Premium TaxEdge Blue + Orange Design System. Strictly under 300 lines.
 */
import { StyleSheet, Platform } from "react-native";
import { BrandColors, BorderRadius, BorderWidth, Spacing, Typography } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.WHITE },
  headerBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing.base, paddingBottom: 12, backgroundColor: BrandColors.WHITE,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: Typography.fontSize.xl, fontWeight: "800",
    color: "#083B75", fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  placeholderBox: { width: 38 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: 16 },

  /* Information Banner Card */
  infoCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F0F7FF",
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: "#BFDBFE",
    padding: 14, gap: 12,
  },
  infoIconWrap: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#DBEAFE",
    justifyContent: "center", alignItems: "center",
  },
  infoCardText: { flex: 1, fontSize: 13, color: "#1E3A8A", lineHeight: 18, fontWeight: "500" },

  /* Form Elements */
  fieldGroup: { gap: 6 },
  label: { fontSize: 13.5, fontWeight: "700", color: "#0F172A" },
  star: { color: "#EF4444" },
  inputWrap: {
    height: 50, backgroundColor: "#F8FAFC", borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin, borderColor: "#E2E8F0", paddingHorizontal: 12,
    flexDirection: "row", alignItems: "center",
  },
  inputLeftIcon: { marginRight: 8 },
  textInput: { flex: 1, height: "100%", fontSize: 14.5, color: BrandColors.TEXT_PRIMARY, fontWeight: "600" },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: { fontSize: 12, color: "#DC2626", fontWeight: "600", marginTop: 2 },

  /* Registered Contact Card */
  contactCard: {
    backgroundColor: "#F8FAFC", borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: "#E2E8F0", padding: 14, gap: 10,
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactIconCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: "#EBF3FF",
    justifyContent: "center", alignItems: "center",
  },
  contactValue: { fontSize: 13.5, fontWeight: "700", color: "#083B75" },
  contactDivider: { height: 1, backgroundColor: "#E2E8F0" },
  contactSubRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  contactSubText: { flex: 1, fontSize: 12, color: "#64748B", lineHeight: 17 },

  /* Request Type Dropdown */
  selectBox: {
    height: 50, backgroundColor: BrandColors.WHITE, borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin, borderColor: "#E2E8F0", paddingHorizontal: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  selectLeftWrap: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, paddingRight: 8 },
  selectText: { fontSize: 14, fontWeight: "600", color: "#083B75", flex: 1 },
  placeholderText: { color: "#94A3B8", fontWeight: "400" },

  /* Certificate Illustration */
  illustrationWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  docGraphic: { width: 90, height: 90, borderRadius: 18, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  sealBadge: {
    position: "absolute", bottom: -6, right: -6, width: 32, height: 32,
    borderRadius: 16, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#FFFFFF",
  },

  /* Fixed Bottom Bar */
  bottomBar: {
    paddingHorizontal: Spacing.base, paddingTop: 12, backgroundColor: BrandColors.WHITE,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  actionOrangeBtn: {
    height: 52, borderRadius: 26, backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    shadowColor: BrandColors.PRIMARY_ORANGE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  actionOrangeBtnText: { fontSize: 15, fontWeight: "800", color: BrandColors.WHITE, letterSpacing: 0.3 },

  /* Success Screen (Matches GST Cancellation & Amendment) */
  successContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  successHero: {
    backgroundColor: BrandColors.PRIMARY_BLUE, paddingHorizontal: 24, paddingBottom: 36,
    alignItems: "center", borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  successHeroIconBox: { marginBottom: 14, position: "relative", alignItems: "center", justifyContent: "center" },
  successHalo: { position: "absolute", width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(255,255,255,0.12)" },
  successHeroCheckCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: "#16A34A",
    justifyContent: "center", alignItems: "center", shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  successRibbonBadge: {
    position: "absolute", bottom: -2, right: -2, width: 26, height: 26,
    borderRadius: 13, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  successHeroTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  successHeroSubtitle: { fontSize: 13, color: "#BFDBFE", textAlign: "center", marginTop: 6, lineHeight: 18, maxWidth: "90%" },
  successCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, marginHorizontal: 16, marginTop: -20,
    padding: 18, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, gap: 10,
  },
  successRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  successRowKeyWrap: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  successRowKey: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  successRowVal: { fontSize: 13, fontWeight: "700", color: BrandColors.TEXT_PRIMARY, textAlign: "right", flex: 1.2 },
  successDivider: { height: 1, backgroundColor: "#F1F5F9" },
  successActionsWrap: { paddingHorizontal: 16, paddingTop: 14, backgroundColor: "#F8FAFC", gap: 10 },
  primaryBtn: {
    height: 50, borderRadius: 25, backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    shadowColor: BrandColors.PRIMARY_ORANGE, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "700", color: BrandColors.WHITE },
  secondaryBtn: {
    height: 50, borderRadius: 25, backgroundColor: "#EBF3FF",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#BFDBFE",
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700", color: "#083B75" },
});
