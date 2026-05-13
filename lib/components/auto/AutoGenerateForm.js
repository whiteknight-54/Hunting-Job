export default function AutoGenerateForm({
  colors,
  theme,
  cardStyle,
  inputStyle,
  labelStyle,
  jd,
  setJd,
  roleName,
  setRoleName,
  companyName,
  setCompanyName,
  disable,
  elapsedTime,
  lastGenerationTime,
  generateError,
  handleGenerate,
}) {
  const canSubmit = !disable && jd.trim() && roleName.trim();

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 12, textTransform: "uppercase" }}>
        Auto generate
      </div>
      <p style={{ fontSize: 12, color: colors.textMuted, margin: "0 0 14px", lineHeight: 1.5 }}>
        Paste the job description and role. The server calls your configured AI provider, merges the result with the profile, and downloads a PDF.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Job description (required)</label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description…"
          rows={10}
          style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical", minHeight: 160, lineHeight: 1.5, background: colors.textareaBg }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Role name (required)</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            style={{ ...inputStyle, borderColor: roleName.trim() ? colors.inputBorder : colors.infoText }}
          />
        </div>
        <div>
          <label style={labelStyle}>Company name (optional)</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Used in PDF filename"
            style={inputStyle}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canSubmit}
        style={{
          width: "100%",
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 600,
          color: colors.buttonText,
          background: canSubmit ? colors.buttonBg : colors.buttonDisabled,
          border: "none",
          borderRadius: 6,
          cursor: canSubmit ? "pointer" : "not-allowed",
          marginBottom: 12,
        }}
      >
        {disable ? `Generating… (${elapsedTime}s)` : "Generate Resume PDF"}
      </button>

      {generateError && (
        <div style={{ marginBottom: 12, padding: "10px 12px", background: colors.errorBg, border: `1px solid ${colors.errorText}`, borderRadius: 6, color: colors.errorText, fontSize: 12 }}>
          {generateError}
        </div>
      )}

      {lastGenerationTime != null && (
        <div style={{ padding: "10px 12px", background: colors.successBg, border: `1px solid ${colors.successText}`, borderRadius: 6, color: colors.successText, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
          PDF generated in {lastGenerationTime}s
        </div>
      )}
    </div>
  );
}
