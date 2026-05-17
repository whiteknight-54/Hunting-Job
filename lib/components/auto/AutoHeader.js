import { QuickCopyGrid } from "../manual/ManualQuickCopyPanel";
import PopoverPanel from "../PopoverPanel";
import { AI_PROVIDER_OPTIONS, formatModelOptionLabel } from "../../core/ai-config";
import { statusChipStyle } from "../../shared/status-chip-style";
import SlackAccountMenu from "../shared/LazySlackAccountMenu";
import { PanelToggleRow } from "../../workflows/manual/ui-styles";
import { PDF_CONTACT_LS_KEYS } from "../../shared/pdf-contact-prefs";
import {
  SETTINGS_POPOVER_GAP_Y_PX,
  SETTINGS_POPOVER_INSET_RIGHT_PX,
  SETTINGS_POPOVER_MAX_WIDTH_PX,
} from "../../workflows/constants";

export default function AutoHeader({
  displayName,
  profileTitle,
  profileSlug,
  theme,
  colors,
  cardStyle,
  workflowLink,
  iconBtn,
  quickCopyFields,
  copiedField,
  copyToClipboard,
  toggleTheme,
  profileReviewOpen,
  setProfileReviewOpen,
  aiProvider,
  aiModel,
  aiModelOptions,
  keyActive,
  driveUploadEnabled,
  setAiProvider,
  setAiModel,
  helpOpen,
  setHelpOpen,
  settingsOpen,
  setSettingsOpen,
  settingsRef,
  labelStyle,
  selectStyle,
  sectionTitleStyle,
  slackUser,
  signOutSlack,
  showPhone,
  setShowPhone,
  showLinkedin,
  setShowLinkedin,
}) {
  const keyStatusLabel = keyActive ? "active" : "inactive";
  const driveStatusLabel = driveUploadEnabled ? "active" : "inactive";

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
            {displayName}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {profileTitle && profileTitle !== "—" && (
              <p style={{ fontSize: 13, color: colors.text, fontWeight: 600, margin: 0 }}>{profileTitle}</p>
            )}
            <span
              title={keyActive ? "Auto can use this model" : "This provider is not available for Auto yet — open AI settings or use Manual"}
              style={statusChipStyle(colors, keyActive)}
            >
              {aiModel}
              <span style={{ fontWeight: 600, opacity: 0.85 }}> · {keyStatusLabel}</span>
            </span>
            <span
              title={
                driveUploadEnabled
                  ? "PDFs upload to Google Drive after generation"
                  : "Set GDRIVE_FOLDER_ID and Google OAuth env vars in .env.local to enable Drive upload"
              }
              style={statusChipStyle(colors, driveUploadEnabled)}
            >
              Drive
              <span style={{ fontWeight: 600, opacity: 0.85 }}> · {driveStatusLabel}</span>
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <a href={`/manual/${profileSlug}`} style={workflowLink}>
            Manual →
          </a>
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
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" style={iconBtn()}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            ref={settingsRef}
            type="button"
            title="AI settings"
            aria-label="AI settings"
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
            maxWidth={SETTINGS_POPOVER_MAX_WIDTH_PX}
            placement="anchor"
            anchorGapY={SETTINGS_POPOVER_GAP_Y_PX}
            insetRightPx={SETTINGS_POPOVER_INSET_RIGHT_PX}
            alignRightToAnchor
            colors={colors}
            theme={theme}
            ariaLabel="AI settings"
          >
              <div style={{ padding: "4px 12px 12px" }}>
                <div style={{ ...sectionTitleStyle, padding: "10px 0 4px", marginBottom: 0 }}>AI</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle} htmlFor="auto-ai-provider">
                    Provider
                  </label>
                  <select
                    id="auto-ai-provider"
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    style={{ ...selectStyle("100%"), width: "100%" }}
                  >
                    {AI_PROVIDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle} htmlFor="auto-ai-model">
                    Model (id : price (speed))
                  </label>
                  <select
                    id="auto-ai-model"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    title="Model id : approximate in/out price (rough speed)"
                    style={{ ...selectStyle("100%"), width: "100%", fontSize: 11 }}
                  >
                    {aiModelOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {formatModelOptionLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ ...sectionTitleStyle, padding: "14px 0 4px", marginBottom: 0 }}>PDF contact</div>
                <PanelToggleRow
                  label="Phone"
                  checked={showPhone}
                  onChange={setShowPhone}
                  lsKey={PDF_CONTACT_LS_KEYS.phone}
                  colors={colors}
                />
                <PanelToggleRow
                  label="LinkedIn"
                  checked={showLinkedin}
                  onChange={setShowLinkedin}
                  lsKey={PDF_CONTACT_LS_KEYS.linkedin}
                  colors={colors}
                />
              </div>
            </PopoverPanel>
          <SlackAccountMenu
            colors={colors}
            theme={theme}
            slackUser={slackUser}
            onSignOut={signOutSlack}
            iconBtn={iconBtn}
          />
        </div>
      </div>
      {quickCopyFields.length > 0 && (
        <div style={{ paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.cardBorder}` }}>
          <QuickCopyGrid
            colors={colors}
            quickCopyFields={quickCopyFields}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
          />
        </div>
      )}
    </div>
  );
}
