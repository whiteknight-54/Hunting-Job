import AppModal from "../AppModal";

export default function ProfileReviewModal({
  open,
  onClose,
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
  copyToClipboard,
  copiedField,
  onMigrateProfile,
  migrationPromptBusy,
}) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Review profile — ${displayName}`}
      ariaLabel="Review profile"
      colors={colors}
      theme={theme}
      maxWidth={640}
      topInsetVh={10}
      headerActions={
        <>
          <button type="button" onClick={() => setProfileReviewMode("formatted")} style={segmentBtn(profileReviewMode === "formatted")}>
            Parsed
          </button>
          <button type="button" onClick={() => setProfileReviewMode("json")} style={segmentBtn(profileReviewMode === "json")}>
            Raw JSON
          </button>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(profileReviewMode === "json" ? profileReviewJson : profileReviewFormatted, "profileReview")
            }
            style={secondaryBtn()}
          >
            {copiedField === "profileReview" ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => onMigrateProfile?.()}
            disabled={!onMigrateProfile || migrationPromptBusy}
            style={secondaryBtn(!onMigrateProfile || migrationPromptBusy)}
            title="Copy migration prompt, then open this profile on GitHub"
          >
            {migrationPromptBusy
              ? "…"
              : copiedField === "migrationPrompt"
                ? "Copied"
                : "Migrate on GitHub"}
          </button>
        </>
      }
    >
      <div style={{ padding: "14px 16px" }}>
        <textarea
          readOnly
          value={profileReviewMode === "json" ? profileReviewJson : profileReviewFormatted}
          style={{
            ...textareaStyle,
            ...monoTextarea,
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            minHeight: "min(52vh, 480px)",
            padding: "12px 14px",
            resize: "none",
          }}
        />
      </div>
    </AppModal>
  );
}
