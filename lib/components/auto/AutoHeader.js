import QuickCopyGrid from "../manual/ManualQuickCopyPanel";
import { WORKFLOW } from "../../workflows/constants";

export default function AutoHeader({
  displayName,
  profileTitle,
  profileSlug,
  theme,
  colors,
  cardStyle,
  quickCopyFields,
  copiedField,
  copyToClipboard,
  toggleTheme,
}) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <h1 style={{ fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 600, margin: "0 0 2px 0" }}>{displayName}</h1>
          {profileTitle && profileTitle !== "—" && (
            <p style={{ fontSize: "clamp(11px, 2.5vw, 12px)", color: colors.textSecondary, margin: 0 }}>{profileTitle}</p>
          )}
          <p style={{ fontSize: 11, color: colors.textMuted, margin: "6px 0 0" }}>
            Workflow: <strong style={{ color: colors.infoText }}>{WORKFLOW.AUTO}</strong> — OpenAI/Claude generates JSON server-side
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <a
            href={`/manual/${profileSlug}`}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              background: colors.copyBg,
              border: `1px solid ${colors.infoText}`,
              borderRadius: 6,
              color: colors.infoText,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Manual apply →
          </a>
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" style={{ padding: "6px 12px", fontSize: 12, background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, cursor: "pointer" }}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>
      {quickCopyFields.length > 0 && (
        <div style={{ paddingTop: 12, borderTop: `1px solid ${colors.cardBorder}` }}>
          <QuickCopyGrid colors={colors} cardStyle={{ marginBottom: 0, padding: 0, border: "none", boxShadow: "none", background: "transparent" }} quickCopyFields={quickCopyFields} copiedField={copiedField} copyToClipboard={copyToClipboard} />
        </div>
      )}
    </div>
  );
}
