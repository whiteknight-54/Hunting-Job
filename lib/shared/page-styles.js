import { ICON_BTN_BASE, TOOLBAR_BTN_BASE } from "../workflows/manual/constants";
import { APP_FONT_FAMILY, APP_MONO_FONT_FAMILY } from "./fonts";

export function createPageStyles(colors, theme) {
  const transition = "border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease";

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: APP_FONT_FAMILY,
    color: colors.text,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    transition,
  };

  const textareaStyle = {
    ...inputStyle,
    background: colors.textareaBg,
    borderColor: colors.textareaBorder,
    lineHeight: 1.5,
    resize: "vertical",
  };

  const labelStyle = {
    display: "block",
    fontSize: "clamp(10px, 2.5vw, 11px)",
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.35px",
  };

  const sectionTitleStyle = {
    fontSize: "11px",
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.45px",
  };

  const subLabelStyle = {
    fontSize: "12px",
    color: colors.textMuted,
    marginBottom: "8px",
    flexShrink: 0,
  };

  const bodyTextStyle = {
    fontSize: "12px",
    color: colors.textMuted,
    margin: "0 0 12px 0",
    lineHeight: 1.55,
  };

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: "10px",
    border: `1px solid ${colors.cardBorder}`,
    padding: "18px",
    marginBottom: "14px",
    boxShadow:
      theme === "dark"
        ? "0 2px 8px rgba(0, 0, 0, 0.25)"
        : "0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04)",
  };

  const primaryBtn = (disabled = false) => ({
    ...TOOLBAR_BTN_BASE,
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: colors.buttonText,
    background: disabled ? colors.buttonDisabled : colors.buttonBg,
    border: "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition,
    whiteSpace: "nowrap",
  });

  const secondaryBtn = (disabled = false) => ({
    ...TOOLBAR_BTN_BASE,
    padding: "0 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: colors.text,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition,
    whiteSpace: "nowrap",
  });

  const selectStyle = (minWidth = 160) => ({
    ...TOOLBAR_BTN_BASE,
    width: "auto",
    minWidth,
    maxWidth: "100%",
    padding: "0 28px 0 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: colors.text,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
    transition,
  });

  const workflowLink = {
    ...TOOLBAR_BTN_BASE,
    padding: "0 12px",
    fontSize: "12px",
    fontWeight: "600",
    background: colors.copyBg,
    border: `1px solid ${colors.accent}`,
    borderRadius: "8px",
    color: colors.accent,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition,
  };

  const segmentBtn = (active = false) => ({
    ...TOOLBAR_BTN_BASE,
    padding: "0 10px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "8px",
    border: `1px solid ${active ? colors.accent : colors.inputBorder}`,
    background: active ? colors.copyBg : colors.inputBg,
    color: active ? colors.accent : colors.text,
    cursor: "pointer",
    transition,
  });

  const quickCopyBtn = (active = false) => ({
    padding: "clamp(6px, 1.5vw, 8px) 6px",
    background: active ? colors.copyBg : colors.inputBg,
    border: `1px solid ${active ? colors.accent : colors.inputBorder}`,
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    minHeight: "56px",
    justifyContent: "center",
    transition,
  });

  const quickCopyLabel = (active = false) => ({
    fontSize: 10,
    fontWeight: "600",
    color: active ? colors.successText : colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.35px",
  });

  const copyBtn = (active = false, disabled = false) => ({
    ...secondaryBtn(disabled),
    background: active ? colors.copyBg : colors.inputBg,
    border: `1px solid ${active ? colors.accent : colors.inputBorder}`,
    color: active ? colors.successText : colors.text,
  });

  const badgeStyle = {
    fontSize: 10,
    fontWeight: 700,
    color: colors.accent,
    background: colors.copyBg,
    border: `1px solid ${colors.accent}`,
    borderRadius: 999,
    padding: "2px 8px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  };

  const textLink = {
    fontSize: 12,
    color: colors.accent,
    fontWeight: 600,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition,
  };

  const ghostBtn = {
    ...TOOLBAR_BTN_BASE,
    padding: "0 12px",
    fontSize: 12,
    fontWeight: 600,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "8px",
    color: colors.text,
    cursor: "pointer",
    transition,
    whiteSpace: "nowrap",
  };

  const bannerError = {
    padding: "10px 12px",
    background: colors.errorBg,
    border: `1px solid ${colors.errorText}`,
    borderRadius: "8px",
    color: colors.errorText,
    fontSize: "12px",
    lineHeight: 1.45,
  };

  const bannerSuccess = {
    padding: "10px 12px",
    background: colors.successBg,
    border: `1px solid ${colors.successText}`,
    borderRadius: "8px",
    color: colors.successText,
    fontSize: "12px",
    fontWeight: "600",
    lineHeight: 1.45,
  };

  const monoTextarea = {
    fontSize: "12px",
    fontFamily: APP_MONO_FONT_FAMILY,
    lineHeight: 1.45,
  };

  const iconBtn = (active = false) => ({
    ...ICON_BTN_BASE,
    background: active ? colors.copyBg : colors.inputBg,
    border: `1px solid ${active ? colors.accent : colors.inputBorder}`,
    color: colors.text,
    transition,
  });

  return {
    inputStyle,
    textareaStyle,
    labelStyle,
    sectionTitleStyle,
    subLabelStyle,
    bodyTextStyle,
    cardStyle,
    primaryBtn,
    secondaryBtn,
    selectStyle,
    workflowLink,
    segmentBtn,
    quickCopyBtn,
    quickCopyLabel,
    copyBtn,
    badgeStyle,
    textLink,
    ghostBtn,
    bannerError,
    bannerSuccess,
    monoTextarea,
    iconBtn,
  };
}
