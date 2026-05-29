import PdfRunProgressStatus from "../shared/PdfRunProgressStatus";
import { formatPdfSuccessMessage, getResumeActionLabel } from "../../shared/resume-action-label";

export default function ManualApplicationForm({
  colors,
  cardStyle,
  inputStyle,
  labelStyle,
  selectStyle,
  primaryBtn,
  secondaryBtn,
  roleName,
  setRoleName,
  companyName,
  setCompanyName,
  jd,
  setJd,
  applicationQuestions,
  setApplicationQuestions,
  handleCopyAtsPrompt,
  selectedAtsPrompt,
  setSelectedAtsPrompt,
  atsPromptOptions,
  manualPrompt,
  copyToClipboard,
  copiedField,
  handleManualGenerate,
  disable,
  pdfRunPhase,
  pdfRunPhaseElapsed,
  pdfFailedElapsed,
  pdfGenerateError,
  selectedTemplate,
  setSelectedTemplate,
  templateOptions,
  pastedContent,
  setPastedContent,
  lastPdfDownloadSeconds,
  lastPdfUploadSeconds,
  driveUploadEnabled,
  lastDriveUpload,
  lastPdfFileName,
  promptError,
  monoTextarea,
  pastedJsonError,
  bannerError,
}) {
  const pdfActionDisabled =
    disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim() || Boolean(pastedJsonError);

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 12, textTransform: "uppercase" }}>
        Application details
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
          <label style={labelStyle}>Role Title</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Software Engineer"
            style={{
              ...inputStyle,
              borderColor: roleName.trim() ? colors.inputBorder : colors.infoText,
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>Company name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g BOC-E"
            style={{
              ...inputStyle,
              borderColor: companyName.trim() ? colors.inputBorder : colors.infoText,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase" }}>
              Step 1 — ATS resume prompt
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={handleCopyAtsPrompt}
                disabled={!jd.trim()}
                style={primaryBtn(!jd.trim())}
              >
                Copy ATS prompt
              </button>
              <select
                value={selectedAtsPrompt}
                onChange={(e) => setSelectedAtsPrompt(e.target.value)}
                style={selectStyle(160)}
              >
                {(atsPromptOptions.length
                  ? atsPromptOptions
                  : [{ id: selectedAtsPrompt, label: selectedAtsPrompt }]
                ).map((p) => {
                  const id = typeof p === "string" ? p : p.id;
                  const label = typeof p === "string" ? p : p.label;
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={() => manualPrompt && copyToClipboard(manualPrompt, "manualPrompt")}
                disabled={!manualPrompt.trim()}
                style={secondaryBtn(!manualPrompt.trim())}
              >
                {copiedField === "manualPrompt" ? "Copied" : "Copy again"}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Job description</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description…"
              rows={6}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 112,
                lineHeight: 1.5,
                background: colors.textareaBg,
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Employer / application questions (optional)</label>
            <textarea
              value={applicationQuestions}
              onChange={(e) => setApplicationQuestions(e.target.value)}
              placeholder="Screening questions, form fields, or notes — included in ATS context and in step 3 prompts."
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 88,
                lineHeight: 1.45,
                background: colors.textareaBg,
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase" }}>
              Step 2 — PDF
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={handleManualGenerate}
                disabled={pdfActionDisabled}
                style={primaryBtn(pdfActionDisabled)}
                title={
                  pastedJsonError
                    ? "Fix tailored resume JSON before generating PDF"
                    : driveUploadEnabled
                      ? "Generate PDF, upload to Google Drive, and download locally"
                      : "Generate PDF and download locally"
                }
              >
                {getResumeActionLabel({ busy: disable, variant: "manual" })}
              </button>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={selectStyle(200)}
              >
                {templateOptions.length === 0 && <option value={selectedTemplate}>{selectedTemplate}</option>}
                {templateOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {(disable || pdfGenerateError) && (
              <PdfRunProgressStatus
                  colors={colors}
                  phase={pdfRunPhase}
                  phaseElapsed={pdfRunPhaseElapsed}
                  driveUploadEnabled={driveUploadEnabled}
                  busyLabel="Generating PDF"
                  failed={Boolean(pdfGenerateError) && !disable}
                  failedAfterSeconds={pdfFailedElapsed}
                  errorMessage={pdfGenerateError}
                />
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <label style={labelStyle}>
              Paste ChatGPT resume JSON
              {pastedContent.trim() && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    color: pastedJsonError ? colors.errorText : colors.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  · {pastedJsonError ? "invalid" : "valid"}
                </span>
              )}
            </label>
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste JSON only output from ChatGPT (markdown fences are OK)."
              rows={8}
              style={{
                ...inputStyle,
                ...monoTextarea,
                flex: 1,
                minHeight: 180,
                resize: "vertical",
                background: colors.textareaBg,
                borderColor: pastedJsonError ? colors.errorText : colors.textareaBorder,
              }}
            />
            {pastedJsonError && <div style={{ ...bannerError, marginTop: 8 }}>{pastedJsonError}</div>}
          </div>

          {lastPdfDownloadSeconds != null && !pdfGenerateError && (
            <div
              style={{
                padding: "10px 12px",
                background: colors.successBg,
                border: `1px solid ${colors.successText}`,
                borderRadius: "6px",
                color: colors.successText,
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {formatPdfSuccessMessage({
                fileName: lastPdfFileName,
                downloadSeconds: lastPdfDownloadSeconds,
                uploadSeconds: lastPdfUploadSeconds,
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
            </div>
          )}
        </div>
      </div>

      {promptError && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            background: colors.errorBg,
            border: `1px solid ${colors.errorText}`,
            borderRadius: "6px",
            color: colors.errorText,
            fontSize: "12px",
          }}
        >
          {promptError}
        </div>
      )}
    </div>
  );
}
