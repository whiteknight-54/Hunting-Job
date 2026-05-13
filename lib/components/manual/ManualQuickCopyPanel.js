export default function ManualQuickCopyPanel({ colors, cardStyle, quickCopyFields, copiedField, copyToClipboard }) {
  if (!quickCopyFields.length) return null;

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 12, textTransform: "uppercase" }}>
        Quick copy panel
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(72px, calc(50% - 6px)), 1fr))",
          gap: "8px",
        }}
      >
        {quickCopyFields.map(({ key, label, value, icon, iconUrl }) => (
          <button
            key={key}
            type="button"
            onClick={() => copyToClipboard(value, key)}
            style={{
              padding: "clamp(6px, 1.5vw, 8px) 6px",
              background: copiedField === key ? colors.copyBg : colors.inputBg,
              border: `1px solid ${copiedField === key ? colors.infoText : colors.inputBorder}`,
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              minHeight: "56px",
              justifyContent: "center",
            }}
          >
            {iconUrl ? (
              <img src={iconUrl} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 16 }}>{icon}</span>
            )}
            <span
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: copiedField === key ? colors.successText : colors.textMuted,
                textTransform: "uppercase",
              }}
            >
              {copiedField === key ? "Copied" : label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
