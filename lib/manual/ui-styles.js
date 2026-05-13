import { writeBoolLs } from "./local-storage";

export const createManualStyles = createPageStyles;

export function PanelToggleRow({ label, checked, onChange, lsKey, colors }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}
    >
      <span style={{ fontSize: 13, color: colors.text }}>{label}</span>
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
