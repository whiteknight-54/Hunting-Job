import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { getPromptForProfile, getTemplateForProfile } from "../../profile-template-mapping";
import { formatProfileForReview, profileToPrettyJson } from "../../profile-format";
import { formatTailoredJsonIssues, validateTailoredJsonInput } from "../../core/resume.js";
import { parseApiError, downloadPdfFromResponse } from "../../api-client";
import { API_ROUTES } from "../constants";
import { PANEL_LS_KEYS } from "./constants";
import { readBoolLs } from "./local-storage";
import { createPageStyles } from "../../shared/page-styles";
import { useProfileSession } from "../../shared/useProfileSession";
import { useGenerationTimer } from "../../shared/useGenerationTimer";

/** Manual workflow: ATS prompt → ChatGPT → paste JSON → PDF → second prompts. */
export function useManualWorkflow() {
  const session = useProfileSession();
  const timer = useGenerationTimer();

  const [jd, setJd] = useState("");
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [applicationQuestions, setApplicationQuestions] = useState("");

  const [manualPrompt, setManualPrompt] = useState("");
  const [promptError, setPromptError] = useState(null);
  const [pdfGenerateError, setPdfGenerateError] = useState(null);
  const [lastDriveUpload, setLastDriveUpload] = useState(null);
  const [pastedContent, setPastedContent] = useState("");

  const [atsPromptOptions, setAtsPromptOptions] = useState([]);
  const [selectedAtsPrompt, setSelectedAtsPrompt] = useState("default");
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("Resume");
  const [secondPromptCatalog, setSecondPromptCatalog] = useState([]);
  const [selectedSecondPromptId, setSelectedSecondPromptId] = useState("screening");
  const [secondPromptBody, setSecondPromptBody] = useState("");
  const [secondPromptError, setSecondPromptError] = useState(null);

  const [showQuickCopyPanel, setShowQuickCopyPanel] = useState(true);
  const [showAtsPromptPreview, setShowAtsPromptPreview] = useState(true);
  const [showPdfPreview, setShowPdfPreview] = useState(true);
  const [showScreeningSection, setShowScreeningSection] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileReviewOpen, setProfileReviewOpen] = useState(false);
  const [profileReviewMode, setProfileReviewMode] = useState("formatted");

  const settingsRef = useRef(null);

  useEffect(() => {
    const legacyPreview = readBoolLs(PANEL_LS_KEYS.preview, null);
    const pref = (key) => {
      const v = readBoolLs(key, null);
      if (v !== null) return v;
      if (legacyPreview !== null) return legacyPreview;
      return true;
    };
    startTransition(() => {
      setShowQuickCopyPanel(readBoolLs(PANEL_LS_KEYS.quickCopy, true));
      setShowAtsPromptPreview(pref(PANEL_LS_KEYS.atsPromptPreview));
      setShowPdfPreview(pref(PANEL_LS_KEYS.pdfPreview));
      setShowScreeningSection(readBoolLs(PANEL_LS_KEYS.screening, true));
    });
  }, []);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [tRes, aRes, sRes] = await Promise.all([
          fetch(API_ROUTES.TEMPLATES),
          fetch(API_ROUTES.ATS_PROMPTS),
          fetch(API_ROUTES.SECOND_PROMPTS),
        ]);
        if (tRes.ok) {
          const t = await tRes.json();
          setTemplateOptions(Array.isArray(t) ? t : []);
        }
        if (aRes.ok) {
          const a = await aRes.json();
          setAtsPromptOptions(Array.isArray(a.prompts) ? a.prompts : []);
        }
        if (sRes.ok) {
          const s = await sRes.json();
          const list = Array.isArray(s.prompts) ? s.prompts : [];
          setSecondPromptCatalog(list);
          if (list.length) {
            setSelectedSecondPromptId((cur) => (list.some((x) => x.id === cur) ? cur : list[0].id));
          }
        }
      } catch {
        /* non-fatal */
      }
    };
    loadLists();
  }, []);

  useEffect(() => {
    if (!session.profileSlug) return;
    setSelectedAtsPrompt(getPromptForProfile(session.profileSlug));
    setSelectedTemplate(getTemplateForProfile(session.profileSlug) || "Resume");
  }, [session.profileSlug]);

  const pageStyles = createPageStyles(session.colors, session.theme);

  const requirePdfNamingFields = () => {
    const missing = [];
    if (!roleName.trim()) missing.push("role title");
    if (!companyName.trim()) missing.push("company name");
    return missing;
  };

  const handleCopyAtsPrompt = async () => {
    if (!jd.trim()) {
      setPromptError("Please enter: job description");
      return;
    }
    if (!session.profileSlug) return;

    setPromptError(null);
    try {
      const response = await fetch(API_ROUTES.MANUAL_PROMPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: session.profileSlug,
          jd,
          atsPrompt: selectedAtsPrompt,
          questions: applicationQuestions,
        }),
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      const data = await response.json();
      const prompt = data?.prompt || "";
      if (!prompt.trim()) throw new Error("Prompt was empty");
      setManualPrompt(prompt);
      await session.copyToClipboard(prompt, "manualPrompt");
    } catch (e) {
      setPromptError(e?.message || "Failed to build/copy prompt");
    }
  };

  const handleBuildSecondPrompt = async (alsoCopy = false) => {
    if (!jd.trim()) {
      setSecondPromptError("Please enter: job description");
      return;
    }
    if (!session.profileSlug) return;

    setSecondPromptError(null);
    try {
      const response = await fetch(API_ROUTES.MANUAL_SECOND_PROMPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: session.profileSlug,
          secondPromptId: selectedSecondPromptId,
          jd,
          questions: applicationQuestions,
          resumeOutputJson: pastedContent.trim() || "{}",
        }),
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      const data = await response.json();
      const prompt = data?.prompt || "";
      if (!prompt.trim()) throw new Error("Second prompt was empty");
      setSecondPromptBody(prompt);
      if (alsoCopy) await session.copyToClipboard(prompt, "secondPrompt");
    } catch (e) {
      setSecondPromptError(e?.message || "Failed to build second prompt");
    }
  };

  const handleManualGenerate = async () => {
    setPdfGenerateError(null);
    setLastDriveUpload(null);
    const missing = requirePdfNamingFields();
    if (missing.length) {
      alert(`Please enter: ${missing.join(", ")}`);
      return;
    }
    if (!session.profileData || !session.profileSlug) {
      alert("Profile data not loaded");
      return;
    }
    if (!pastedContent.trim()) {
      alert("Paste the JSON response from ChatGPT first");
      return;
    }

    await timer.runTimed(async () => {
      try {
        const response = await fetch(API_ROUTES.MANUAL_GENERATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: session.profileSlug,
            template: selectedTemplate,
            roleName: roleName.trim(),
            companyName: companyName.trim(),
            content: pastedContent,
            jd,
            atsPrompt: selectedAtsPrompt,
          }),
        });
        const fallback = `${session.profileBasename?.replace(/\s+/g, "_") || session.profileSlug}.pdf`;
        const { driveUpload } = await downloadPdfFromResponse(response, fallback);
        setLastDriveUpload(driveUpload);
      } catch (error) {
        const msg = error?.message || "Unknown error";
        setPdfGenerateError(`Failed to generate PDF: ${msg}`);
        throw error;
      }
    });
  };

  const profileReviewFormatted = session.profileData ? formatProfileForReview(session.profileData) : "";
  const profileReviewJson = session.profileData ? profileToPrettyJson(session.profileData) : "";
  const profileJobCount = session.profileData?.experience?.length || 0;

  const pastedJsonError = useMemo(() => {
    const result = validateTailoredJsonInput(pastedContent, profileJobCount);
    return formatTailoredJsonIssues(result);
  }, [pastedContent, profileJobCount]);

  return {
    ...session,
    profileResumeFileName: session.profileBasename,
    selectedProfileData: session.profileData,
    jd,
    setJd,
    roleName,
    setRoleName,
    companyName,
    setCompanyName,
    applicationQuestions,
    setApplicationQuestions,
    disable: timer.busy,
    elapsedTime: timer.elapsedTime,
    lastGenerationTime: timer.lastDuration,
    manualPrompt,
    setManualPrompt,
    promptError,
    pdfGenerateError,
    lastDriveUpload,
    pastedContent,
    setPastedContent,
    pastedJsonError,
    profileJobCount,
    atsPromptOptions,
    selectedAtsPrompt,
    setSelectedAtsPrompt,
    templateOptions,
    selectedTemplate,
    setSelectedTemplate,
    secondPromptCatalog,
    selectedSecondPromptId,
    setSelectedSecondPromptId,
    secondPromptBody,
    setSecondPromptBody,
    secondPromptError,
    showQuickCopyPanel,
    setShowQuickCopyPanel,
    showAtsPromptPreview,
    setShowAtsPromptPreview,
    showPdfPreview,
    setShowPdfPreview,
    showScreeningSection,
    setShowScreeningSection,
    settingsOpen,
    setSettingsOpen,
    helpOpen,
    setHelpOpen,
    profileReviewOpen,
    setProfileReviewOpen,
    profileReviewMode,
    setProfileReviewMode,
    settingsRef,
    ...pageStyles,
    handleCopyAtsPrompt,
    handleBuildSecondPrompt,
    handleManualGenerate,
    profileReviewFormatted,
    profileReviewJson,
  };
}
