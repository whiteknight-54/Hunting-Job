import { ICON_BTN_BASE } from "../manual/constants";

export function createPageStyles(colors, theme) {
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: "inherit",
    color: colors.text,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "clamp(10px, 2.5vw, 11px)",
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  };

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: "8px",
    border: `1px solid ${colors.cardBorder}`,
    padding: "16px",
    marginBottom: "12px",
    boxShadow: theme === "dark" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
  };

  const iconBtn = (active = false) => ({
    ...ICON_BTN_BASE,
    background: active ? colors.copyBg : colors.inputBg,
    border: `1px solid ${active ? colors.infoText : colors.inputBorder}`,
    color: colors.text,
  });

  return { inputStyle, labelStyle, cardStyle, iconBtn };
}
