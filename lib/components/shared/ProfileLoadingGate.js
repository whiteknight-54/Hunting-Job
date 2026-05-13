import { lazy, Suspense } from "react";

const LazySpinner = lazy(() => import("../LoadingSpinner"));

/** Shared loading gate for profile routes (auto + manual). */
export default function ProfileLoadingGate({ ready, loaded, colors, children }) {
  if (!ready) {
    return (
      <Suspense
        fallback={
          <div style={{ padding: "40px", textAlign: "center", color: colors?.textMuted || "#64748b" }}>
            Loading...
          </div>
        }
      >
        <LazySpinner />
      </Suspense>
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
        <Suspense fallback={<span style={{ color: colors.text }}>Loading...</span>}>
          <LazySpinner />
        </Suspense>
      </div>
    );
  }

  return children;
}
