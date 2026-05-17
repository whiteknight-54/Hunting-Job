import { useMemo, useRef, useState } from "react";
import { downloadPdfFromResponse } from "../../api-client";
import { API_ROUTES } from "../constants";
import { estimateCostUsdForTokens } from "../../core/ai-config";
import { formatProfileForReview, profileToPrettyJson } from "../../profile-format";
import { createPageStyles } from "../../shared/page-styles";
import { useProfileSession } from "../../shared/useProfileSession";
import { useGenerationTimer } from "../../shared/useGenerationTimer";
import { useAiSelection } from "./useAiSelection";
import { usePdfContactPrefs } from "../../shared/pdf-contact-prefs";
import { roughPromptCompletionTokens } from "./generation-estimate";

const SERVER_KEY_ENV_BY_PROVIDER = Object.freeze({
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  groq: "GROQ_API_KEY",
});

/** Auto workflow: one-click AI PDF generation (OpenAI / Anthropic / Groq). */
export function useAutoWorkflow() {
  const session = useProfileSession();
  const ai = useAiSelection(session.aiConfig);
  const aiSelectionRef = useRef({ provider: ai.aiProvider, model: ai.aiModel });
  aiSelectionRef.current = { provider: ai.aiProvider, model: ai.aiModel };
  const timer = useGenerationTimer();
  const pdfContact = usePdfContactPrefs();

  const [jd, setJd] = useState("");
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [generateError, setGenerateError] = useState(null);
  const [pdfRunFailed, setPdfRunFailed] = useState(false);
  const [profileReviewOpen, setProfileReviewOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileReviewMode, setProfileReviewMode] = useState("formatted");
  const [lastAiUsage, setLastAiUsage] = useState(null);
  const [lastDriveUpload, setLastDriveUpload] = useState(null);

  const pageStyles = createPageStyles(session.colors, session.theme);

  const generationRoughEstimate = useMemo(() => {
    if (!timer.busy || !session.profileData) return null;
    const r = roughPromptCompletionTokens(session.profileData, jd);
    const estimatedUsd = estimateCostUsdForTokens(ai.aiProvider, ai.aiModel, r.promptTok, r.completionTok);
    return { ...r, estimatedUsd };
  }, [timer.busy, session.profileData, jd, ai.aiProvider, ai.aiModel]);

  const handleGenerate = async () => {
    setGenerateError(null);
    setPdfRunFailed(false);
    setLastAiUsage(null);
    setLastDriveUpload(null);
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

    const { provider, model } = aiSelectionRef.current;
    if (!ai.keyActive) {
      const envName = SERVER_KEY_ENV_BY_PROVIDER[provider] || "API key";
      setGenerateError(`${envName} is not set on the server`);
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
            provider,
            model,
            showPhone: pdfContact.showPhone,
            showLinkedin: pdfContact.showLinkedin,
          }),
        });
        const fallback = `${session.profileBasename?.replace(/\s+/g, "_") || session.profileSlug}.pdf`;
        const { usage, driveUpload } = await downloadPdfFromResponse(response, fallback);
        setLastAiUsage(usage);
        setLastDriveUpload(driveUpload);
      } catch (err) {
        const msg = err?.message || "Failed to generate PDF";
        setGenerateError(msg);
        setPdfRunFailed(true);
        throw err;
      }
    });
  };

  const profileReviewFormatted = session.profileData ? formatProfileForReview(session.profileData) : "";
  const profileReviewJson = session.profileData ? profileToPrettyJson(session.profileData) : "";

  return {
    ...session,
    ...ai,
    jd,
    setJd,
    roleName,
    setRoleName,
    companyName,
    setCompanyName,
    generateError,
    pdfRunFailed,
    disable: timer.busy,
    elapsedTime: timer.elapsedTime,
    lastGenerationTime: timer.lastDuration,
    lastAiUsage,
    lastDriveUpload,
    showPhone: pdfContact.showPhone,
    setShowPhone: pdfContact.setShowPhone,
    showLinkedin: pdfContact.showLinkedin,
    setShowLinkedin: pdfContact.setShowLinkedin,
    generationRoughEstimate,
    profileReviewOpen,
    setProfileReviewOpen,
    helpOpen,
    setHelpOpen,
    profileReviewMode,
    setProfileReviewMode,
    profileReviewFormatted,
    profileReviewJson,
    ...pageStyles,
    handleGenerate,
  };
}
