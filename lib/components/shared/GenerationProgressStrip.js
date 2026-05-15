/**
 * PDF / AI generation progress track: accent + indeterminate while running,
 * error-colored solid bar when a run has failed (both Manual and Auto).
 */
export default function GenerationProgressStrip({ colors, variant = "accent", animated = true }) {
  const isError = variant === "error";
  const barColor = isError ? colors.errorText : colors.accent;
  const trackColor = isError ? colors.errorBg : colors.cardBorder;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes hkGenProgInd{0%{transform:translateX(-100%)}100%{transform:translateX(380%)}}`,
        }}
      />
      <div
        style={{
          height: 5,
          borderRadius: 4,
          overflow: "hidden",
          background: trackColor,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: animated ? "32%" : "100%",
            borderRadius: 4,
            background: barColor,
            animation: animated ? "hkGenProgInd 1.15s ease-in-out infinite" : undefined,
          }}
        />
      </div>
    </>
  );
}
