export default function LoadingSpinner({ accent = "#3b82f6" }) {
  const track = `${accent}33`;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${track}`,
          borderTop: `3px solid ${accent}`,
          borderRadius: "50%",
          animation: "hj-spin 0.9s linear infinite",
        }}
      />
      <style>{`
        @keyframes hj-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
