import { useState } from "react";
import { downloadPdfFromResponse } from "../../api-client";
import { API_ROUTES } from "../constants";
import { createPageStyles } from "../../shared/page-styles";
import { useProfileSession } from "../../shared/useProfileSession";
import { useGenerationTimer } from "../../shared/useGenerationTimer";

/** Auto workflow: one-click AI PDF generation (OpenAI / Claude). */
export function useAutoWorkflow() {
  const session = useProfileSession();
  const timer = useGenerationTimer();

  const [jd, setJd] = useState("");
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [generateError, setGenerateError] = useState(null);

  const { inputStyle, labelStyle, cardStyle } = createPageStyles(session.colors, session.theme);

  const handleGenerate = async () => {
    setGenerateError(null);
    if (!jd.trim()) {
      setGenerateError("Please enter a job description");
      return;
    }
    if (!roleName.trim()) {
      setGenerateError("Please enter a role name");
      return;
    }
    if (!session.profileData || !session.profileSlug) {
      setGenerateError("Profile data not loaded");
      return;
    }

    await timer.runTimed(async () => {
      try {
        const response = await fetch(API_ROUTES.GENERATE_AUTO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: session.profileSlug,
            jd,
            roleName: roleName.trim(),
            companyName: companyName.trim() || null,
          }),
        });
        const fallback = `${session.profileBasename?.replace(/\s+/g, "_") || session.profileSlug}.pdf`;
        await downloadPdfFromResponse(response, fallback);
      } catch (err) {
        setGenerateError(err?.message || "Failed to generate PDF");
      }
    });
  };

  return {
    ...session,
    jd,
    setJd,
    roleName,
    setRoleName,
    companyName,
    setCompanyName,
    generateError,
    disable: timer.busy,
    elapsedTime: timer.elapsedTime,
    lastGenerationTime: timer.lastDuration,
    inputStyle,
    labelStyle,
    cardStyle,
    handleGenerate,
  };
}
