import { WORKFLOW } from "../../workflows/constants";
import PopoverPanel from "../PopoverPanel";
import { PANEL_LS_KEYS } from "../../manual/constants";
import { PanelToggleRow } from "../../manual/ui-styles";

export default function ManualHeader({
  displayName,
  profileTitle,
  profileSlug,
  theme,
  colors,
  cardStyle,
  iconBtn,
  helpOpen,
  setHelpOpen,
  profileReviewOpen,
  setProfileReviewOpen,
  settingsOpen,
  setSettingsOpen,
  settingsRef,
  toggleTheme,
  showQuickCopyPanel,
  setShowQuickCopyPanel,
  showPreviewSection,
  setShowPreviewSection,
  showScreeningSection,
  setShowScreeningSection,
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: "700", margin: "0 0 6px 0" }}>{displayName}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>{profileTitle}</span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              · {WORKFLOW.MANUAL}
            </span>
            <button
              type="button"
              title="Review profile"
              aria-label="Review profile"
              onClick={() => {
                setProfileReviewOpen(true);
                setHelpOpen(false);
                setSettingsOpen(false);
              }}
              style={iconBtn(profileReviewOpen)}
            >
              ⋮
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {profileSlug ? (
            <a
              href={`/${profileSlug}`}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: colors.infoText,
                border: `1px solid ${colors.infoText}`,
                borderRadius: 6,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              ← Auto
            </a>
          ) : null}
          <button
            type="button"
            title="Help"
            aria-label="Help"
            onClick={() => {
              setHelpOpen(true);
              setSettingsOpen(false);
            }}
            style={iconBtn(helpOpen)}
          >
            ?
          </button>
          <button
            type="button"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
            onClick={toggleTheme}
            style={iconBtn()}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <div ref={settingsRef}>
            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              onClick={() => {
                setSettingsOpen((o) => !o);
                setHelpOpen(false);
              }}
              style={iconBtn(settingsOpen)}
              aria-expanded={settingsOpen}
              aria-haspopup="true"
            >
              ⚙
            </button>
            <PopoverPanel
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              anchorRef={settingsRef}
              maxWidth={300}
              colors={colors}
              theme={theme}
              ariaLabel="Settings"
            >
              <div style={{ padding: "4px 12px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, padding: "10px 0 4px", textTransform: "uppercase" }}>
                  Panels
                </div>
                <PanelToggleRow
                  label="Quick copy panel"
                  checked={showQuickCopyPanel}
                  onChange={setShowQuickCopyPanel}
                  lsKey={PANEL_LS_KEYS.quickCopy}
                  colors={colors}
                />
                <PanelToggleRow
                  label="Preview section (prompt + template)"
                  checked={showPreviewSection}
                  onChange={setShowPreviewSection}
                  lsKey={PANEL_LS_KEYS.preview}
                  colors={colors}
                />
                <PanelToggleRow
                  label="Screening / 2nd prompts section"
                  checked={showScreeningSection}
                  onChange={setShowScreeningSection}
                  lsKey={PANEL_LS_KEYS.screening}
                  colors={colors}
                />
              </div>
            </PopoverPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
