/** Mini PDF preview — scaled iframe (same technique as /preview). */
export default function TemplatePdfMiniPreview({
  templateId,
  colors,
  theme,
  miniHeight = 220,
  expanded = false,
  onToggleExpand,
}) {
  const url = templateId ? `/api/preview?template=${encodeURIComponent(templateId)}` : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", minHeight: miniHeight }}>
      <div
        style={{
          flex: 1,
          minHeight: expanded ? "clamp(360px, 55vh, 520px)" : miniHeight,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${colors.inputBorder}`,
          background: theme === "dark" ? "#0f172a" : "#f8fafc",
          transition: "min-height 0.25s ease",
        }}
      >
        {url ? (
          <div
            style={{
              width: expanded ? "100%" : "400%",
              height: expanded ? "100%" : "800px",
              transform: expanded ? "scale(1)" : "scale(0.25)",
              transformOrigin: "top left",
              transition: "transform 0.25s ease",
            }}
          >
            <iframe title={`Template preview ${templateId}`} src={url} style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
        ) : (
          <div style={{ padding: 16, color: colors.textMuted, fontSize: 13 }}>Select a template.</div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 600,
              background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: 6,
              color: colors.text,
              cursor: "pointer",
            }}
          >
            {expanded ? "Collapse" : "Expand preview"}
          </button>
        )}
        {url && (
          <a href="/preview" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: colors.infoText, fontWeight: 600 }}>
            All templates →
          </a>
        )}
      </div>
    </div>
  );
}
