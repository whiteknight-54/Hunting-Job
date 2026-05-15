import { writeBoolLs } from "./local-storage";

export function PanelSectionLabel({ label, colors, indent = false }) {
  return (
    <div
      style={{
        fontSize: indent ? 12 : 13,
        fontWeight: 600,
        color: indent ? colors.textSecondary : colors.text,
        padding: indent ? "6px 0 2px 10px" : "8px 0 4px",
        borderBottom: indent ? "none" : `1px solid ${colors.cardBorder}`,
      }}
    >
      {label}
    </div>
  );
}

export function PanelToggleRow({ label, checked, onChange, lsKey, colors, indent = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: indent ? "6px 0 6px 10px" : "8px 0",
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}
    >
      <span style={{ fontSize: indent ? 12 : 13, color: colors.text }}>{label}</span>
      <button
        type="button"
        onClick={() => {
          const next = !checked;
          onChange(next);
          writeBoolLs(lsKey, next);
        }}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          background: checked ? colors.buttonBg : colors.inputBorder,
          position: "relative",
          flexShrink: 0,
        }}
        aria-pressed={checked}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 22 : 4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}
