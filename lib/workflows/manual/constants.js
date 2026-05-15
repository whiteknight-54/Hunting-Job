import { APP_FONT_FAMILY } from "../../shared/fonts";

export const PREVIEW_COLUMN_HEIGHT = "clamp(200px, 28vh, 360px)";
export const PREVIEW_COLUMN_MIN_HEIGHT = 200;

export const PANEL_LS_KEYS = {
  quickCopy: "manual_ui_showQuickCopy",
  /** @deprecated legacy — migrated to atsPromptPreview / pdfPreview */
  preview: "manual_ui_showPreview",
  atsPromptPreview: "manual_ui_showAtsPromptPreview",
  pdfPreview: "manual_ui_showPdfPreview",
  screening: "manual_ui_showScreening",
};

export const TOOLBAR_BTN_HEIGHT = 36;

export const TOOLBAR_BTN_BASE = {
  height: TOOLBAR_BTN_HEIGHT,
  minHeight: TOOLBAR_BTN_HEIGHT,
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
  fontFamily: APP_FONT_FAMILY,
};

export const ICON_BTN_BASE = {
  ...TOOLBAR_BTN_BASE,
  width: TOOLBAR_BTN_HEIGHT,
  padding: 0,
  fontSize: 18,
  borderRadius: 8,
  cursor: "pointer",
};
