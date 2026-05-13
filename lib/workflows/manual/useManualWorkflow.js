import { useEffect, useRef, useState } from "react";
import { getPromptForProfile, getTemplateForProfile } from "../../profile-template-mapping";
import { formatProfileForReview, profileToPrettyJson } from "../../profile-format";
import { parseApiError, downloadPdfFromResponse } from "../../api-client";
import { API_ROUTES } from "../constants";
import { PANEL_LS_KEYS } from "../../manual/constants";
import { readBoolLs } from "../../manual/local-storage";
import { createPageStyles } from "../../shared/page-styles";
import { useProfileSession } from "../../shared/useProfileSession";
import { useGenerationTimer } from "../../shared/useGenerationTimer";
import { PanelToggleRow } from "../../manual/ui-styles";

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
  const [showPreviewSection, setShowPreviewSection] = useState(true);
  const [showScreeningSection, setShowScreeningSection] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileReviewOpen, setProfileReviewOpen] = useState(false);
  const [profileReviewMode, setProfileReviewMode] = useState("formatted");

  const settingsRef = useRef(null);

  useEffect(() => {
    setShowQuickCopyPanel(readBoolLs(PANEL_LS_KEYS.quickCopy, true));
    setShowPreviewSection(readBoolLs(PANEL_LS_KEYS.preview, true));
    setShowScreeningSection(readBoolLs(PANEL_LS_KEYS.screening, true));
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

  const { inputStyle, labelStyle, cardStyle, iconBtn } = createPageStyles(session.colors, session.theme);

  const requireCoreFields = () => {
    const missing = [];
    if (!jd.trim()) missing.push("job description");
    if (!roleName.trim()) missing.push("role title");
    if (!companyName.trim()) missing.push("company name");
    return missing;
  };

  const handleCopyAtsPrompt = async () => {
    const missing = requireCoreFields();
    if (missing.length) {
      setPromptError(`Please enter: ${missing.join(", ")}`);
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
          roleTitle: roleName.trim(),
          companyName: companyName.trim(),
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
    const missing = requireCoreFields();
    if (missing.length) {
      setSecondPromptError(`Please enter: ${missing.join(", ")}`);
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
          roleTitle: roleName.trim(),
          companyName: companyName.trim(),
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
    if (!roleName.trim()) {
      alert("Please enter a role name");
      return;
    }
    if (!companyName.trim()) {
      alert("Please enter a company name");
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
          }),
        });
        const fallback = `${session.profileBasename?.replace(/\s+/g, "_") || session.profileSlug}.pdf`;
        await downloadPdfFromResponse(response, fallback);
      } catch (error) {
        alert("Failed to generate PDF: " + (error?.message || "Unknown error"));
        throw error;
      }
    });
  };

  const profileReviewFormatted = session.profileData ? formatProfileForReview(session.profileData) : "";
  const profileReviewJson = session.profileData ? profileToPrettyJson(session.profileData) : "";

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
    pastedContent,
    setPastedContent,
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
    showPreviewSection,
    setShowPreviewSection,
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
    inputStyle,
    labelStyle,
    cardStyle,
    iconBtn,
    handleCopyAtsPrompt,
    handleBuildSecondPrompt,
    handleManualGenerate,
    profileReviewFormatted,
    profileReviewJson,
  };
}
