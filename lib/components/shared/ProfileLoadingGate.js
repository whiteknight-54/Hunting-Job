import { lazy, Suspense } from "react";

const LazySpinner = lazy(() => import("../LoadingSpinner"));

/** Shared loading gate for profile routes (auto + manual). */
export default function ProfileLoadingGate({ ready, loaded, colors, children }) {
  const spinner = (
    <Suspense fallback={<span style={{ color: colors?.textMuted || "#64748b" }}>Loading...</span>}>
      <LazySpinner accent={colors?.accent || colors?.buttonBg} />
    </Suspense>
  );

  if (!ready) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: colors?.textMuted || "#64748b" }}>
        {spinner}
      </div>
    );
  }

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {spinner}
      </div>
    );
  }

  return children;
}
