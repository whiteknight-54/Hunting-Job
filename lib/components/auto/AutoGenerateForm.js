import { useNarrowLayout } from "../../shared/useNarrowLayout";
import { formatTokenShort } from "../../workflows/auto/generation-estimate";
import GenerationProgressStrip from "../shared/GenerationProgressStrip";
import { formatPdfSuccessMessage, getResumeActionLabel } from "../../shared/resume-action-label";

function fmtUsdEstimate(n) {
  if (n == null || !Number.isFinite(n)) return null;
  if (n < 0.0001) return `~$${n.toExponential(1)}`;
  if (n < 0.01) return `~$${n.toFixed(5)}`;
  return `~$${n.toFixed(4)}`;
}

export default function AutoGenerateForm({
  colors,
  cardStyle,
  textareaStyle,
  labelStyle,
  sectionTitleStyle,
  bodyTextStyle,
  inputStyle,
  primaryBtn,
  bannerError,
  bannerSuccess,
  jd,
  setJd,
  roleName,
  setRoleName,
  companyName,
  setCompanyName,
  disable,
  elapsedTime,
  lastGenerationTime,
  lastAiUsage,
  generationRoughEstimate,
  aiModel,
  generateError,
  pdfRunFailed,
  driveUploadEnabled,
  lastDriveUpload,
  handleGenerate,
}) {
  const isNarrow = useNarrowLayout();
  const canSubmit = !disable && jd.trim() && roleName.trim();

  const roughUsd = generationRoughEstimate ? fmtUsdEstimate(generationRoughEstimate.estimatedUsd) : null;
  const doneUsd = lastAiUsage ? fmtUsdEstimate(lastAiUsage.estimatedUsd) : null;

  return (
    <div style={cardStyle}>
      <div style={sectionTitleStyle}>Auto generate</div>
      {!isNarrow && (
        <p style={bodyTextStyle}>
          Paste the job description. Role and company are used only for the downloaded PDF filename.
        </p>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Job description (required)</label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description…"
          rows={6}
          style={{ ...textareaStyle, minHeight: 112 }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>app_key</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="P001|J012345"    
            style={{ ...inputStyle, borderColor: roleName.trim() ? colors.inputBorder : colors.infoText }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>Company name (optional)</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g Boc-e"
            style={inputStyle}
          />
        </div>
      </div>

      <button type="button" onClick={handleGenerate} disabled={!canSubmit} style={{ ...primaryBtn(!canSubmit), width: "100%", marginBottom: 10 }}>
        {getResumeActionLabel({ busy: disable, driveUploadEnabled, busyLabel: "Generating" })}
      </button>

      {generateError && !disable && !pdfRunFailed && (
        <div style={{ ...bannerError, marginBottom: 12 }}>{generateError}</div>
      )}

      {(disable || pdfRunFailed) && (
        <div style={{ marginBottom: 14 }}>
          <GenerationProgressStrip colors={colors} variant={disable ? "accent" : "error"} animated={disable} />
          {disable ? (
            <div style={{ fontSize: 12, lineHeight: 1.45, color: colors.text, opacity: 0.92 }}>
              <strong style={{ color: colors.accent }}>
                {driveUploadEnabled ? "Uploading to Drive…" : "Generating…"}
              </strong>
              <span style={{ opacity: 0.75 }}> · </span>
              <strong style={{ color: colors.accent }}>{elapsedTime}s</strong>
              <span style={{ opacity: 0.75 }}> · </span>
              <span title="Rough prompt size from JD + profile + template (chars÷4); completion guessed until the API returns.">
                ~{formatTokenShort(generationRoughEstimate?.promptTok)} in / ~{formatTokenShort(generationRoughEstimate?.completionTok)} out tok
              </span>
              {roughUsd ? (
                <>
                  <span style={{ opacity: 0.75 }}> · </span>
                  <span title="From list prices in settings (indicative).">{roughUsd}</span>
                </>
              ) : null}
              <span style={{ opacity: 0.75 }}> · </span>
              <span style={{ opacity: 0.75 }}>{aiModel}</span>
            </div>
          ) : (
            <div style={{ fontSize: 12, lineHeight: 1.45 }}>
              <strong style={{ color: colors.errorText }}>Generation failed</strong>
              <span style={{ color: colors.errorText, opacity: 0.88 }}> · after {elapsedTime}s</span>
              <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: colors.errorText }}>{generateError}</div>
            </div>
          )}
        </div>
      )}

      {lastGenerationTime != null && !pdfRunFailed && (
        <div style={bannerSuccess}>
          {formatPdfSuccessMessage({
            seconds: lastGenerationTime,
            driveUploadEnabled,
            driveUpload: lastDriveUpload,
          })}
          {lastDriveUpload?.status === "ok" && lastDriveUpload.webViewLink && (
            <>
              {" "}
              ·{" "}
              <a
                href={lastDriveUpload.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.successText, textDecoration: "underline" }}
              >
                Open in Drive
              </a>
            </>
          )}
          {lastAiUsage?.promptTokens != null && lastAiUsage?.completionTokens != null && (
            <>
              {" "}
              · <strong>{formatTokenShort(lastAiUsage.promptTokens)}</strong> in /{" "}
              <strong>{formatTokenShort(lastAiUsage.completionTokens)}</strong> out tok
            </>
          )}
          {doneUsd && (
            <>
              {" "}
              · <span title="From list prices in ai-config (indicative).">{doneUsd}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
