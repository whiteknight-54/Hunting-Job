import AppModal from "../AppModal";
import HelpGuideContent from "./HelpGuideContent";

export default function ManualModals({
  helpOpen,
  setHelpOpen,
  profileReviewOpen,
  setProfileReviewOpen,
  displayName,
  colors,
  theme,
  profileReviewMode,
  setProfileReviewMode,
  profileReviewFormatted,
  profileReviewJson,
  copyToClipboard,
  copiedField,
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
      >
        <div style={{ padding: "14px 16px" }}>
          <HelpGuideContent colors={colors} />
        </div>
      </AppModal>

      <AppModal
        open={profileReviewOpen}
        onClose={() => setProfileReviewOpen(false)}
        title={`Review profile — ${displayName}`}
        ariaLabel="Review profile"
        colors={colors}
        theme={theme}
        headerActions={
          <>
            <button
              type="button"
              onClick={() => setProfileReviewMode("formatted")}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: `1px solid ${profileReviewMode === "formatted" ? colors.infoText : colors.inputBorder}`,
                background: profileReviewMode === "formatted" ? colors.copyBg : colors.inputBg,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              Parsed
            </button>
            <button
              type="button"
              onClick={() => setProfileReviewMode("json")}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: `1px solid ${profileReviewMode === "json" ? colors.infoText : colors.inputBorder}`,
                background: profileReviewMode === "json" ? colors.copyBg : colors.inputBg,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              Raw JSON
            </button>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(profileReviewMode === "json" ? profileReviewJson : profileReviewFormatted, "profileReview")
              }
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: `1px solid ${colors.inputBorder}`,
                background: colors.inputBg,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              {copiedField === "profileReview" ? "Copied" : "Copy"}
            </button>
          </>
        }
      >
        <textarea
          readOnly
          value={profileReviewMode === "json" ? profileReviewJson : profileReviewFormatted}
          style={{
            display: "block",
            width: "100%",
            minHeight: 320,
            padding: "12px 14px",
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            color: colors.text,
            background: colors.textareaBg,
            border: "none",
            outline: "none",
            resize: "none",
            lineHeight: 1.45,
            boxSizing: "border-box",
          }}
        />
      </AppModal>
    </>
  );
}
