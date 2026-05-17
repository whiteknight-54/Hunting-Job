import LoadingSpinner from "../LoadingSpinner";

/** Blocks only until the router has a profile slug; shell UI renders while JSON loads. */
export default function ProfileLoadingGate({ ready, colors, children }) {
  if (!ready) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: colors?.textMuted || "#64748b" }}>
        <LoadingSpinner accent={colors?.accent || colors?.buttonBg} />
      </div>
    );
  }

  return children;
}
