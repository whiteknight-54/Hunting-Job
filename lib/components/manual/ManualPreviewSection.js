import dynamic from "next/dynamic";
import LoadingSpinner from "../LoadingSpinner";

const TemplatePdfMiniPreview = dynamic(() => import("../TemplatePdfMiniPreview"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
      <LoadingSpinner />
    </div>
  ),
});
import { previewColumnLayout } from "../../workflows/manual/constants";

const PREVIEW_HEIGHT_SCALE_TWO_COLUMN = 1.3;
const PREVIEW_HEIGHT_SCALE_ONE_COLUMN = 1.7;

function previewColumnShell(twoColumnLayout) {
  const scale = twoColumnLayout ? PREVIEW_HEIGHT_SCALE_TWO_COLUMN : PREVIEW_HEIGHT_SCALE_ONE_COLUMN;
  return {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    ...previewColumnLayout(scale),
  };
}

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
  showPhone,
  showLinkedin,
}) {
  if (!showAtsPromptPreview && !showPdfPreview) return null;

  const twoColumnLayout = showAtsPromptPreview && showPdfPreview;
  const columnShell = previewColumnShell(twoColumnLayout);

  const gridColumns = twoColumnLayout
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
              <span style={subLabelStyle}>PDF Preview ({selectedTemplate})</span>
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
              showPhone={showPhone}
              showLinkedin={showLinkedin}
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
