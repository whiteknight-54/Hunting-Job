import Link from "next/link";
import PopoverPanel from "../PopoverPanel";
import { QuickCopyGrid } from "./ManualQuickCopyPanel";
import { PANEL_LS_KEYS } from "../../workflows/manual/constants";
import { PDF_CONTACT_LS_KEYS } from "../../shared/pdf-contact-prefs";
import { PanelToggleRow, PanelSectionLabel } from "../../workflows/manual/ui-styles";
import { statusChipStyle } from "../../shared/status-chip-style";
import SlackAccountMenu from "../shared/SlackAccountMenu";

export default function ManualHeader({
  displayName,
  profileTitle,
  profileSlug,
  theme,
  colors,
  cardStyle,
  iconBtn,
  workflowLink,
  sectionTitleStyle,
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
  showAtsPromptPreview,
  setShowAtsPromptPreview,
  showPdfPreview,
  setShowPdfPreview,
  showPhone,
  setShowPhone,
  showLinkedin,
  setShowLinkedin,
  showScreeningSection,
  setShowScreeningSection,
  quickCopyFields,
  copiedField,
  copyToClipboard,
  driveUploadEnabled,
  pastedContent,
  pastedJsonError,
  slackUser,
  signOutSlack,
}) {
  const hasPastedJson = Boolean(String(pastedContent || "").trim());
  const resumeJsonValid = hasPastedJson && !pastedJsonError;
  const driveStatusLabel = driveUploadEnabled ? "active" : "inactive";

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
          <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
            {displayName}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {profileTitle && profileTitle !== "—" && (
              <p style={{ fontSize: 13, color: colors.text, fontWeight: 600, margin: 0 }}>{profileTitle}</p>
            )}
            <span title="Manual workflow — paste prompts into ChatGPT" style={statusChipStyle(colors, true)}>
              ChatGPT
              <span style={{ fontWeight: 600, opacity: 0.85 }}> · active</span>
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
            {hasPastedJson && (
              <span
                title={
                  resumeJsonValid
                    ? "Tailored resume JSON passes validation"
                    : pastedJsonError || "Fix tailored resume JSON before generating PDF"
                }
                style={statusChipStyle(colors, resumeJsonValid)}
              >
                Resume JSON
                <span style={{ fontWeight: 600, opacity: 0.85 }}> · {resumeJsonValid ? "valid" : "invalid"}</span>
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <SlackAccountMenu
            colors={colors}
            theme={theme}
            slackUser={slackUser}
            onSignOut={signOutSlack}
            iconBtn={iconBtn}
          />
          {profileSlug ? (
            <Link href={`/auto/${profileSlug}`} style={workflowLink}>
              Auto →
            </Link>
          ) : null}
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
          <button
            type="button"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
            onClick={toggleTheme}
            style={iconBtn()}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            ref={settingsRef}
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
            placement="top"
            topInsetVh={10}
            alignTopRightToAnchor
            colors={colors}
            theme={theme}
            ariaLabel="Settings"
          >
              <div style={{ padding: "4px 12px 12px" }}>
                <div style={{ ...sectionTitleStyle, padding: "10px 0 4px", marginBottom: 0 }}>Panels</div>
                <PanelToggleRow
                  label="Quick-copy panel"
                  checked={showQuickCopyPanel}
                  onChange={setShowQuickCopyPanel}
                  lsKey={PANEL_LS_KEYS.quickCopy}
                  colors={colors}
                />
                <PanelSectionLabel label="Preview section" colors={colors} />
                <PanelToggleRow
                  label="ATS prompt preview"
                  checked={showAtsPromptPreview}
                  onChange={setShowAtsPromptPreview}
                  lsKey={PANEL_LS_KEYS.atsPromptPreview}
                  colors={colors}
                  indent
                />
                <PanelToggleRow
                  label="PDF preview"
                  checked={showPdfPreview}
                  onChange={setShowPdfPreview}
                  lsKey={PANEL_LS_KEYS.pdfPreview}
                  colors={colors}
                  indent
                />
                <PanelToggleRow
                  label="Phone"
                  checked={showPhone}
                  onChange={setShowPhone}
                  lsKey={PDF_CONTACT_LS_KEYS.phone}
                  colors={colors}
                  indent
                />
                <PanelToggleRow
                  label="LinkedIn"
                  checked={showLinkedin}
                  onChange={setShowLinkedin}
                  lsKey={PDF_CONTACT_LS_KEYS.linkedin}
                  colors={colors}
                  indent
                />
                <PanelToggleRow
                  label="Screening section"
                  checked={showScreeningSection}
                  onChange={setShowScreeningSection}
                  lsKey={PANEL_LS_KEYS.screening}
                  colors={colors}
                />
              </div>
            </PopoverPanel>
        </div>
      </div>
      {showQuickCopyPanel && quickCopyFields.length > 0 && (
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
