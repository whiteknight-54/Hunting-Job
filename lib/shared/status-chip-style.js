/** Pill styles for active / inactive (or valid / invalid) header chips. */
export function statusChipStyle(colors, active) {
  const color = active ? colors.accent : colors.errorText;
  const bg = active ? colors.copyBg : colors.errorBg;
  return {
    fontSize: 10,
    fontWeight: 700,
    color,
    background: bg,
    border: `1px solid ${color}`,
    borderRadius: 999,
    padding: "2px 8px",
    letterSpacing: "0.2px",
    flexShrink: 0,
  };
}
