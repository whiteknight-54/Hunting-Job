import TemplatePdfMiniPreview from "../TemplatePdfMiniPreview";
import { PREVIEW_COLUMN_HEIGHT, PREVIEW_COLUMN_MIN_HEIGHT } from "../../workflows/manual/constants";

const columnShell = {
  display: "flex",
  flexDirection: "column",
  height: PREVIEW_COLUMN_HEIGHT,
  minHeight: PREVIEW_COLUMN_MIN_HEIGHT,
  minWidth: 0,
};

export default function ManualPreviewSection({
  colors,
  cardStyle,
  sectionTitleStyle,
  subLabelStyle,
  textareaStyle,
  monoTextarea,
  manualPrompt,
  setManualPrompt,
  selectedTemplate,
  profileSlug,
  profileJobCount,
  pastedContent,
  theme,
  showAtsPromptPreview,
  showPdfPreview,
}) {
  if (!showAtsPromptPreview && !showPdfPreview) return null;

  const gridColumns =
    showAtsPromptPreview && showPdfPreview
      ? "repeat(auto-fit, minmax(min(100%, 280px), 1fr))"
      : "minmax(0, 1fr)";

  return (
    <div style={cardStyle}>
      <div style={sectionTitleStyle}>Preview</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {showAtsPromptPreview && (
          <div style={columnShell}>
            <div style={subLabelStyle}>ATS prompt (editable)</div>
            <textarea
              value={manualPrompt}
              onChange={(e) => setManualPrompt(e.target.value)}
              placeholder='Use "Copy ATS prompt" to generate, or edit before copying.'
              style={{
                ...textareaStyle,
                ...monoTextarea,
                flex: 1,
                minHeight: 0,
                resize: "none",
              }}
            />
          </div>
        )}
        {showPdfPreview && (
          <div style={columnShell}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 8,
                flexShrink: 0,
              }}
            >
              <span style={subLabelStyle}>Template PDF preview ({selectedTemplate})</span>
              <a
                href="/preview"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: colors.accent,
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                All templates →
              </a>
            </div>
            <TemplatePdfMiniPreview
              templateId={selectedTemplate}
              profileSlug={profileSlug}
              profileJobCount={profileJobCount}
              pastedContent={pastedContent}
              colors={colors}
              theme={theme}
              fillParent
            />
          </div>
        )}
      </div>
    </div>
  );
}
