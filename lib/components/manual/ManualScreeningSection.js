export default function ManualScreeningSection({
  colors,
  cardStyle,
  sectionTitleStyle,
  selectStyle,
  primaryBtn,
  secondaryBtn,
  bannerError,
  labelStyle,
  textareaStyle,
  monoTextarea,
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
  const noJd = !jd.trim();

  return (
    <div style={cardStyle}>
      <div style={sectionTitleStyle}>Step 3 — Second ChatGPT prompt</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <select
          value={selectedSecondPromptId}
          onChange={(e) => setSelectedSecondPromptId(e.target.value)}
          style={selectStyle(260)}
        >
          {secondPromptCatalog.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => handleBuildSecondPrompt(true)} disabled={noJd} style={primaryBtn(noJd)}>
          Build &amp; copy prompt
        </button>
        <button type="button" onClick={() => handleBuildSecondPrompt(false)} disabled={noJd} style={secondaryBtn(noJd)}>
          Build only
        </button>
        <button
          type="button"
          onClick={() => secondPromptBody && copyToClipboard(secondPromptBody, "secondPrompt")}
          disabled={!secondPromptBody.trim()}
          style={secondaryBtn(!secondPromptBody.trim())}
        >
          {copiedField === "secondPrompt" ? "Copied" : "Copy preview"}
        </button>
      </div>
      {selectedEntry?.description && (
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>{selectedEntry.description}</div>
      )}
      {secondPromptError && <div style={{ ...bannerError, marginBottom: 10 }}>{secondPromptError}</div>}
      <label style={labelStyle}>Second prompt preview</label>
      <textarea
        value={secondPromptBody}
        onChange={(e) => setSecondPromptBody(e.target.value)}
        placeholder='Click "Build only" or "Build & copy" after entering a job description. Resume JSON defaults to {} if the paste area is empty.'
        rows={8}
        style={{ ...textareaStyle, ...monoTextarea, minHeight: 160 }}
      />
    </div>
  );
}
