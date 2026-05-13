import TemplatePdfMiniPreview from "../TemplatePdfMiniPreview";
import { PREVIEW_COLUMN_HEIGHT } from "../../manual/constants";

export default function ManualPreviewSection({
  colors,
  cardStyle,
  manualPrompt,
  setManualPrompt,
  selectedTemplate,
  profileSlug,
  pastedContent,
  theme,
}) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 12, textTransform: "uppercase" }}>
        Preview
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: PREVIEW_COLUMN_HEIGHT,
            minHeight: 280,
          }}
        >
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, flexShrink: 0 }}>
            ATS prompt (editable)
          </div>
          <textarea
            value={manualPrompt}
            onChange={(e) => setManualPrompt(e.target.value)}
            placeholder='Use "Copy ATS prompt" to generate, or edit before copying.'
            style={{
              flex: 1,
              width: "100%",
              minHeight: 0,
              padding: "10px 12px",
              fontSize: "12px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              color: colors.text,
              background: colors.textareaBg,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: "6px",
              outline: "none",
              resize: "none",
              lineHeight: 1.45,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: PREVIEW_COLUMN_HEIGHT,
            minHeight: 280,
          }}
        >
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
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              Template PDF preview ({selectedTemplate})
            </span>
            <a
              href="/preview"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: colors.infoText,
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
            pastedContent={pastedContent}
            colors={colors}
            theme={theme}
            fillParent
          />
        </div>
      </div>
    </div>
  );
}
