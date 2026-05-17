import GenerationProgressStrip from "./GenerationProgressStrip";
import { getPdfBusyStatusLabel } from "../../shared/resume-action-label";

/** Progress bar + phase label during PDF download / Drive upload. */
export default function PdfRunProgressStatus({
  colors,
  phase,
  phaseElapsed,
  driveUploadEnabled,
  busyLabel = "Generating PDF",
  aiModel = "",
  failed = false,
  failedTitle = "PDF generation failed",
  failedAfterSeconds,
  errorMessage,
}) {
  return (
    <div style={{ marginTop: 10, marginBottom: 4 }}>
      <GenerationProgressStrip colors={colors} variant={failed ? "error" : "accent"} animated={!failed} />
      {failed ? (
        <div style={{ fontSize: 12, lineHeight: 1.45 }}>
          <strong style={{ color: colors.errorText }}>{failedTitle}</strong>
          {failedAfterSeconds != null && (
            <span style={{ color: colors.errorText, opacity: 0.88 }}> · after {failedAfterSeconds}s</span>
          )}
          {errorMessage && (
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: colors.errorText }}>{errorMessage}</div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, lineHeight: 1.45, color: colors.text, opacity: 0.92 }}>
          <strong style={{ color: colors.accent }}>
            {getPdfBusyStatusLabel({ phase, phaseElapsed, driveUploadEnabled, busyLabel, aiModel })}
          </strong>
        </div>
      )}
    </div>
  );
}
