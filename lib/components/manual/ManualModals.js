import AppModal from "../AppModal";
import HelpGuideContent from "./HelpGuideContent";
import ProfileReviewModal from "../shared/ProfileReviewModal";

export default function ManualModals({
  helpOpen,
  setHelpOpen,
  profileReviewOpen,
  setProfileReviewOpen,
  displayName,
  colors,
  theme,
  textareaStyle,
  monoTextarea,
  segmentBtn,
  secondaryBtn,
  profileReviewMode,
  setProfileReviewMode,
  profileReviewFormatted,
  profileReviewJson,
  hasProfileOverride,
  saveProfileOverride,
  resetProfileOverride,
  copyToClipboard,
  copiedField,
  runProfileMigration,
  migrationPromptBusy,
}) {
  return (
    <>
      <AppModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Usage guide"
        ariaLabel="Usage guide"
        colors={colors}
        theme={theme}
        maxWidth={640}
        topInsetVh={10}
      >
        <div style={{ padding: "14px 16px" }}>
          <HelpGuideContent colors={colors} />
        </div>
      </AppModal>

      <ProfileReviewModal
        open={profileReviewOpen}
        onClose={() => setProfileReviewOpen(false)}
        displayName={displayName}
        colors={colors}
        theme={theme}
        textareaStyle={textareaStyle}
        monoTextarea={monoTextarea}
        segmentBtn={segmentBtn}
        secondaryBtn={secondaryBtn}
        profileReviewMode={profileReviewMode}
        setProfileReviewMode={setProfileReviewMode}
        profileReviewFormatted={profileReviewFormatted}
        profileReviewJson={profileReviewJson}
        hasProfileOverride={hasProfileOverride}
        onSaveProfileOverride={saveProfileOverride}
        onResetProfileOverride={resetProfileOverride}
        copyToClipboard={copyToClipboard}
        copiedField={copiedField}
        onMigrateProfile={runProfileMigration}
        migrationPromptBusy={migrationPromptBusy}
      />
    </>
  );
}
