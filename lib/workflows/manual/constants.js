import { APP_FONT_FAMILY } from "../../shared/fonts";

/** Base preview column size before layout scale (×1.3 two-column, ×1.7 single-column). */
export const PREVIEW_COLUMN_BASE = { minPx: 200, vh: 28, maxPx: 360 };

export function previewColumnLayout(scale) {
  const minPx = Math.round(PREVIEW_COLUMN_BASE.minPx * scale);
  const maxPx = Math.round(PREVIEW_COLUMN_BASE.maxPx * scale);
  const vh = Math.round(PREVIEW_COLUMN_BASE.vh * scale * 10) / 10;
  return {
    height: `clamp(${minPx}px, ${vh}vh, ${maxPx}px)`,
    minHeight: minPx,
  };
}

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
