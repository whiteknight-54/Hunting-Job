import { useEffect, useState } from "react";
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
  hasProfileOverride,
  onSaveProfileOverride,
  onResetProfileOverride,
  copyToClipboard,
  copiedField,
  onMigrateProfile,
  migrationPromptBusy,
}) {
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setJsonDraft(profileReviewJson);
    setJsonError(null);
  }, [open, profileReviewJson]);

  useEffect(() => {
    if (profileReviewMode === "json") {
      setJsonDraft(profileReviewJson);
      setJsonError(null);
    }
  }, [profileReviewMode, profileReviewJson]);

  const handleApplyJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("Profile JSON must be an object");
        return;
      }
      onSaveProfileOverride?.(parsed);
    } catch {
      setJsonError("Invalid JSON — fix syntax before applying");
    }
  };

  const handleResetJson = () => {
    setJsonError(null);
    onResetProfileOverride?.();
  };

  const jsonEditable = profileReviewMode === "json";
  const copyText = jsonEditable ? jsonDraft : profileReviewFormatted;

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
          {jsonEditable ? (
            <>
              <button type="button" onClick={handleApplyJson} style={secondaryBtn()}>
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetJson}
                disabled={!hasProfileOverride}
                style={secondaryBtn(!hasProfileOverride)}
                title="Remove temporary override and use the file on disk"
              >
                Reset
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => copyToClipboard(copyText, "profileReview")} style={secondaryBtn()}>
            {copiedField === "profileReview" ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => onMigrateProfile?.()}
            disabled={!onMigrateProfile || migrationPromptBusy}
            style={secondaryBtn(!onMigrateProfile || migrationPromptBusy)}
            title="Copy migration prompt, then open GitHub profiles folder"
          >
            {migrationPromptBusy
              ? "…"
              : copiedField === "migrationPrompt"
                ? "Copied"
                : "Add New on Github"}
          </button>
        </>
      }
    >
      <div style={{ padding: "14px 16px" }}>
        {hasProfileOverride ? (
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              color: colors.accent || colors.link,
              lineHeight: 1.4,
            }}
          >
            Temporary override active — prompts and PDF generation use this JSON (stored in this browser only).
          </p>
        ) : jsonEditable ? (
          <p style={{ margin: "0 0 10px", fontSize: 12, color: colors.textMuted, lineHeight: 1.4 }}>
            Edit JSON and click Apply to use it for this session. Changes are not saved to GitHub.
          </p>
        ) : null}
        {jsonError ? (
          <p style={{ margin: "0 0 8px", fontSize: 12, color: colors.errorText || "#e55" }}>{jsonError}</p>
        ) : null}
        <textarea
          readOnly={!jsonEditable}
          value={jsonEditable ? jsonDraft : profileReviewFormatted}
          onChange={jsonEditable ? (e) => setJsonDraft(e.target.value) : undefined}
          style={{
            ...textareaStyle,
            ...monoTextarea,
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            minHeight: "min(52vh, 480px)",
            padding: "12px 14px",
            resize: jsonEditable ? "vertical" : "none",
            borderColor: jsonError ? colors.errorText || "#e55" : undefined,
          }}
        />
      </div>
    </AppModal>
  );
}
