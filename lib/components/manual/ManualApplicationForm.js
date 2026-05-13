export default function ManualApplicationForm({
  colors,
  cardStyle,
  inputStyle,
  labelStyle,
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
  elapsedTime,
  selectedTemplate,
  setSelectedTemplate,
  templateOptions,
  pastedContent,
  setPastedContent,
  lastGenerationTime,
  promptError,
}) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 12, textTransform: "uppercase" }}>
        Application details
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Role title (required)</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            style={{
              ...inputStyle,
              borderColor: roleName.trim() ? colors.inputBorder : colors.infoText,
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>Company name (required)</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Used in prompts and PDF filename"
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
                disabled={!jd.trim() || !roleName.trim() || !companyName.trim()}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: colors.buttonText,
                  background: !jd.trim() || !roleName.trim() || !companyName.trim() ? colors.buttonDisabled : colors.buttonBg,
                  border: "none",
                  borderRadius: "6px",
                  cursor: !jd.trim() || !roleName.trim() || !companyName.trim() ? "not-allowed" : "pointer",
                }}
              >
                Copy ATS prompt
              </button>
              <select
                value={selectedAtsPrompt}
                onChange={(e) => setSelectedAtsPrompt(e.target.value)}
                style={{ ...inputStyle, maxWidth: "100%", width: "auto", minWidth: 160, cursor: "pointer" }}
              >
                {(atsPromptOptions.length ? atsPromptOptions : [selectedAtsPrompt]).map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => manualPrompt && copyToClipboard(manualPrompt, "manualPrompt")}
                disabled={!manualPrompt.trim()}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: colors.text,
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: "6px",
                  cursor: !manualPrompt.trim() ? "not-allowed" : "pointer",
                }}
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
              rows={10}
              style={{
                ...inputStyle,
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: 160,
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
                fontFamily: "inherit",
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
                disabled={disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim()}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: colors.buttonText,
                  background:
                    disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim()
                      ? colors.buttonDisabled
                      : colors.buttonBg,
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim() ? "not-allowed" : "pointer",
                }}
              >
                {disable ? `Generating… (${elapsedTime}s)` : "Download resume PDF"}
              </button>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{ ...inputStyle, maxWidth: "100%", width: "auto", minWidth: 200, cursor: "pointer" }}
              >
                {templateOptions.length === 0 && <option value={selectedTemplate}>{selectedTemplate}</option>}
                {templateOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <label style={labelStyle}>Paste ChatGPT resume JSON</label>
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste JSON only output from ChatGPT (markdown fences are OK)."
              rows={14}
              style={{
                ...inputStyle,
                flex: 1,
                minHeight: 260,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                lineHeight: 1.45,
                resize: "vertical",
                background: colors.textareaBg,
              }}
            />
          </div>

          {lastGenerationTime != null && (
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
              PDF generated in {lastGenerationTime}s
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
