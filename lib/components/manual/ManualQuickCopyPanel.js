export function QuickCopyGrid({ colors, quickCopyFields, copiedField, copyToClipboard }) {
  if (!quickCopyFields.length) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(72px, calc(50% - 6px)), 1fr))",
        gap: "8px",
      }}
    >
      {quickCopyFields.map(({ key, label, value, icon, iconUrl, openInNewTab }) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            if (openInNewTab && value) {
              window.open(String(value), "_blank", "noopener,noreferrer");
              return;
            }
            copyToClipboard(value, key);
          }}
          style={{
            padding: "clamp(6px, 1.5vw, 8px) 6px",
            background: copiedField === key ? colors.copyBg : colors.inputBg,
            border: `1px solid ${copiedField === key ? colors.infoText : colors.inputBorder}`,
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            minHeight: "56px",
            justifyContent: "center",
            transition: "border-color 0.15s ease, background 0.15s ease",
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
  );
}

export default function ManualQuickCopyPanel({
  colors,
  cardStyle,
  sectionTitleStyle,
  quickCopyFields,
  copiedField,
  copyToClipboard,
  showTitle = true,
}) {
  if (!quickCopyFields.length) return null;

  return (
    <div style={cardStyle}>
      {showTitle && <div style={sectionTitleStyle}>Quick copy panel</div>}
      <QuickCopyGrid
        colors={colors}
        quickCopyFields={quickCopyFields}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
      />
    </div>
  );
}
