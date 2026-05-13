export default function ManualScreeningSection({
  colors,
  cardStyle,
  inputStyle,
  labelStyle,
  secondPromptCatalog,
  selectedSecondPromptId,
  setSelectedSecondPromptId,
  handleBuildSecondPrompt,
  jd,
  secondPromptBody,
  setSecondPromptBody,
  secondPromptError,
  copyToClipboard,
  copiedField,
}) {
  const selectedEntry = secondPromptCatalog.find((p) => p.id === selectedSecondPromptId);

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 8, textTransform: "uppercase" }}>
        Step 3 — Second ChatGPT prompt
      </div>
      <p style={{ fontSize: 12, color: colors.textMuted, margin: "0 0 12px 0", lineHeight: 1.5 }}>
        Uses job description, profile JSON, pasted resume JSON, and optional questions. Role title and company name from the form are
        not included (they are only used for ATS prompts and PDF filename). Edit the preview before copying if you want to tweak wording.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <select
          value={selectedSecondPromptId}
          onChange={(e) => setSelectedSecondPromptId(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 260, cursor: "pointer" }}
        >
          {secondPromptCatalog.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleBuildSecondPrompt(true)}
          disabled={!jd.trim()}
          style={{
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: "600",
            color: colors.buttonText,
            background: !jd.trim() ? colors.buttonDisabled : colors.buttonBg,
            border: "none",
            borderRadius: "6px",
            cursor: !jd.trim() ? "not-allowed" : "pointer",
          }}
        >
          Build &amp; copy prompt
        </button>
        <button
          type="button"
          onClick={() => handleBuildSecondPrompt(false)}
          disabled={!jd.trim()}
          style={{
            padding: "10px 12px",
            fontSize: "13px",
            fontWeight: "600",
            color: colors.text,
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: "6px",
            cursor: !jd.trim() ? "not-allowed" : "pointer",
          }}
        >
          Build only
        </button>
        <button
          type="button"
          onClick={() => secondPromptBody && copyToClipboard(secondPromptBody, "secondPrompt")}
          disabled={!secondPromptBody.trim()}
          style={{
            padding: "10px 12px",
            fontSize: "13px",
            fontWeight: "600",
            color: colors.text,
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: "6px",
            cursor: !secondPromptBody.trim() ? "not-allowed" : "pointer",
          }}
        >
          {copiedField === "secondPrompt" ? "Copied" : "Copy preview"}
        </button>
      </div>
      {selectedEntry?.description && (
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>{selectedEntry.description}</div>
      )}
      {secondPromptError && (
        <div
          style={{
            marginBottom: 10,
            padding: "10px 12px",
            background: colors.errorBg,
            border: `1px solid ${colors.errorText}`,
            borderRadius: "6px",
            color: colors.errorText,
            fontSize: "12px",
          }}
        >
          {secondPromptError}
        </div>
      )}
      <label style={labelStyle}>Second prompt preview</label>
      <textarea
        value={secondPromptBody}
        onChange={(e) => setSecondPromptBody(e.target.value)}
        placeholder='Click "Build only" or "Build & copy" after entering a job description. Resume JSON defaults to {} if the paste area is empty.'
        rows={14}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: "12px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          color: colors.text,
          background: colors.textareaBg,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: "6px",
          outline: "none",
          resize: "vertical",
          minHeight: 240,
          lineHeight: 1.45,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
