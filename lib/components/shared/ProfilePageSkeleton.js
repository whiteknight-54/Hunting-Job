/** Placeholder blocks while profile JSON loads (header already visible). */
export default function ProfilePageSkeleton({ colors }) {
  const bar = (w = "100%", h = 14) => ({
    width: w,
    height: h,
    borderRadius: 6,
    background: colors.inputBg,
    opacity: 0.55,
  });

  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}
    >
      <div style={bar("70%")} />
      <div style={{ ...bar(), height: 120 }} />
      <div style={bar("40%")} />
      <div style={{ ...bar(), height: 48 }} />
    </div>
  );
}
