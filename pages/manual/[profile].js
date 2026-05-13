import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { slugToProfileName, getPromptForProfile, getTemplateForProfile } from "../../lib/profile-template-mapping";
import { formatProfileForReview, profileToPrettyJson } from "../../lib/profile-format";
import { MANUAL_HELP_SECTIONS } from "../../lib/manual-help-guide";
import TemplatePdfMiniPreview from "../../lib/components/TemplatePdfMiniPreview";

const LoadingSpinner = lazy(() =>
  Promise.resolve({
    default: () => (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(74, 144, 226, 0.3)",
            borderTop: "3px solid #4a90e2",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    ),
  })
);

const LS = {
  quickCopy: "manual_ui_showQuickCopy",
  preview: "manual_ui_showPreview",
  screening: "manual_ui_showScreening",
};

const readBoolLs = (key, defaultVal) => {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultVal;
    return v === "1" || v === "true";
  } catch {
    return defaultVal;
  }
};

const writeBoolLs = (key, val) => {
  try {
    localStorage.setItem(key, val ? "1" : "0");
  } catch {
    /* ignore */
  }
};

const ICON_BTN = {
  width: 36,
  height: 36,
  padding: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  lineHeight: 1,
  borderRadius: 8,
  cursor: "pointer",
};

function useFixedDropdownStyle(anchorRef, isOpen) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!isOpen || !anchorRef?.current) {
      setStyle({});
      return;
    }
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 16);
      const right = Math.max(8, window.innerWidth - r.right);
      setStyle({
        position: "fixed",
        top: r.bottom + 8,
        right,
        width,
        zIndex: 1200,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, anchorRef]);

  return style;
}

function HelpGuideContent({ colors }) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.55, color: colors.textSecondary }}>
      {MANUAL_HELP_SECTIONS.map((sec) => (
        <div key={sec.id} style={{ marginBottom: 16 }}>
          <motionless
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${colors.cardBorder}`,
            }}
          >
            {sec.title}
          </motionless>
          {(sec.paragraphs || []).map((p) => (
            <p key={p.slice(0, 24)} style={{ margin: "0 0 8px 0" }}>
              {p}
            </p>
          ))}
          {sec.bullets?.length > 0 && (
            <ul style={{ margin: "0 0 8px 0", paddingLeft: 18 }}>
              {sec.bullets.map((b) => (
                <li key={b.slice(0, 32)} style={{ marginBottom: 4 }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {sec.note && (
            <p style={{ margin: 0, fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>
              {sec.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function motionless({ style, children, ...rest }) {
  return (
    <div style={style} {...rest}>
      {children}
    </div>
  );
}

export default function ManualProfilePage() {
  const router = useRouter();
  const { profile: profileSlug } = router.query;

  const [jd, setJd] = useState("");
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [applicationQuestions, setApplicationQuestions] = useState("");
  const [disable, setDisable] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastGenerationTime, setLastGenerationTime] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [profileResumeFileName, setProfileResumeFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [gdriveFolderId, setGdriveFolderId] = useState(null);

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileReviewOpen, setProfileReviewOpen] = useState(false);
  const [profileReviewMode, setProfileReviewMode] = useState("formatted");
  const [templatePreviewExpanded, setTemplatePreviewExpanded] = useState(false);

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const settingsRef = useRef(null);
  const helpRef = useRef(null);
  const profileMenuRef = useRef(null);

  const settingsDropdownStyle = useFixedDropdownStyle(settingsRef, settingsOpen);
  const helpDropdownStyle = useFixedDropdownStyle(helpRef, helpOpen);
  const profileMenuDropdownStyle = useFixedDropdownStyle(profileMenuRef, profileMenuOpen);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    setShowQuickCopyPanel(readBoolLs(LS.quickCopy, true));
    setShowPreviewSection(readBoolLs(LS.preview, true));
    setShowScreeningSection(readBoolLs(LS.screening, true));
  }, []);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    if (settingsOpen || helpOpen || profileMenuOpen) document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [settingsOpen, helpOpen, profileMenuOpen]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setGdriveFolderId(d.gdriveFolderId || null))
      .catch(() => setGdriveFolderId(null));
  }, []);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [tRes, aRes, sRes] = await Promise.all([
          fetch("/api/templates"),
          fetch("/api/ats-prompts"),
          fetch("/api/second-prompts"),
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
    if (!profileSlug) return;

    setLoading(true);
    const resumeFile = slugToProfileName(profileSlug);

    if (!resumeFile) {
      router.push("/");
      return;
    }

    setProfileResumeFileName(resumeFile);
    setSelectedAtsPrompt(getPromptForProfile(profileSlug));
    setSelectedTemplate(getTemplateForProfile(profileSlug) || "Resume");

    const loadData = async () => {
      try {
        const response = await fetch(`/api/profiles/${encodeURIComponent(resumeFile)}`);
        if (!response.ok) {
          router.push("/");
          return;
        }
        const data = await response.json();
        setSelectedProfileData(data);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);
  }, [profileSlug, router]);

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getLastCompany = () => selectedProfileData?.experience?.[0]?.company || null;
  const getLastRole = () => selectedProfileData?.experience?.[0]?.title || null;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const themeColors = {
    dark: {
      bg: "#0f172a",
      cardBg: "#1e293b",
      cardBorder: "#334155",
      text: "#f1f5f9",
      textSecondary: "#cbd5e1",
      textMuted: "#94a3b8",
      inputBg: "#1e293b",
      inputBorder: "#475569",
      inputFocus: "#3b82f6",
      textareaBg: "#0f172a",
      buttonBg: "#3b82f6",
      buttonHover: "#2563eb",
      buttonText: "#ffffff",
      buttonDisabled: "#475569",
      successBg: "rgba(34, 197, 94, 0.1)",
      successText: "#22c55e",
      infoBg: "rgba(59, 130, 246, 0.1)",
      infoText: "#3b82f6",
      copyBg: "rgba(59, 130, 246, 0.15)",
      copyHover: "rgba(59, 130, 246, 0.25)",
      warnBg: "rgba(245, 158, 11, 0.12)",
      warnText: "#f59e0b",
      errorBg: "rgba(239, 68, 68, 0.12)",
      errorText: "#ef4444",
    },
    light: {
      bg: "#ffffff",
      cardBg: "#ffffff",
      cardBorder: "#e2e8f0",
      text: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#64748b",
      inputBg: "#ffffff",
      inputBorder: "#cbd5e1",
      inputFocus: "#3b82f6",
      textareaBg: "#f8fafc",
      buttonBg: "#3b82f6",
      buttonHover: "#2563eb",
      buttonText: "#ffffff",
      buttonDisabled: "#cbd5e1",
      successBg: "rgba(34, 197, 94, 0.1)",
      successText: "#16a34a",
      infoBg: "rgba(59, 130, 246, 0.1)",
      infoText: "#2563eb",
      copyBg: "#f1f5f9",
      copyHover: "#e2e8f0",
      warnBg: "rgba(245, 158, 11, 0.12)",
      warnText: "#b45309",
      errorBg: "rgba(239, 68, 68, 0.12)",
      errorText: "#b91c1c",
    },
  };

  const colors = themeColors[theme];

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
      alert(`Please enter: ${missing.join(", ")}`);
      return;
    }
    if (!profileSlug) {
      alert("Profile not loaded");
      return;
    }

    setPromptError(null);
    try {
      const response = await fetch("/api/manual_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profileSlug,
          jd,
          atsPrompt: selectedAtsPrompt,
          roleTitle: roleName.trim(),
          companyName: companyName.trim(),
          questions: applicationQuestions,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || err?.message || (await response.text()) || "Failed to build prompt");
      }

      const data = await response.json();
      const prompt = data?.prompt || "";
      if (!prompt.trim()) throw new Error("Prompt was empty");
      setManualPrompt(prompt);
      await copyToClipboard(prompt, "manualPrompt");
    } catch (e) {
      setPromptError(e?.message || "Failed to build/copy prompt");
      alert("Failed to build/copy prompt: " + (e?.message || "Unknown error"));
    }
  };

  const handleBuildSecondPrompt = async (alsoCopy = false) => {
    const missing = requireCoreFields();
    if (missing.length) {
      alert(`Please enter: ${missing.join(", ")}`);
      return;
    }
    if (!profileSlug) return;

    setSecondPromptError(null);
    try {
      const response = await fetch("/api/manual_second_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profileSlug,
          secondPromptId: selectedSecondPromptId,
          jd,
          roleTitle: roleName.trim(),
          companyName: companyName.trim(),
          questions: applicationQuestions,
          resumeOutputJson: pastedContent.trim() || "{}",
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || err?.message || "Failed to build second prompt");
      }
      const data = await response.json();
      const prompt = data?.prompt || "";
      if (!prompt.trim()) throw new Error("Second prompt was empty");
      setSecondPromptBody(prompt);
      if (alsoCopy) await copyToClipboard(prompt, "secondPrompt");
    } catch (e) {
      setSecondPromptError(e?.message || "Failed to build second prompt");
      alert("Second prompt: " + (e?.message || "Unknown error"));
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
    if (!selectedProfileData || !profileSlug) {
      alert("Profile data not loaded");
      return;
    }
    if (!pastedContent.trim()) {
      alert("Paste the JSON response from ChatGPT first");
      return;
    }

    setDisable(true);
    setElapsedTime(0);
    startTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    try {
      const response = await fetch("/api/manual_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profileSlug,
          template: selectedTemplate,
          roleName: roleName.trim(),
          companyName: companyName.trim(),
          content: pastedContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${profileResumeFileName?.replace(/\s+/g, "_") || profileSlug}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setLastGenerationTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    } catch (error) {
      console.error("Manual generation error:", error);
      alert("Failed to generate PDF: " + error.message);
    } finally {
      setDisable(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      startTimeRef.current = null;
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: "inherit",
    color: colors.text,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "clamp(10px, 2.5vw, 11px)",
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  };

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: "8px",
    border: `1px solid ${colors.cardBorder}`,
    padding: "16px",
    marginBottom: "12px",
    boxShadow: theme === "dark" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
  };

  if (!router.isReady || !profileSlug) {
    return (
      <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading...</div>}>
        <LoadingSpinner />
      </Suspense>
    );
  }

  if (loading || !selectedProfileData) {
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
        <Suspense fallback={<div style={{ color: colors.text }}>Loading...</div>}>
          <LoadingSpinner />
        </Suspense>
      </div>
    );
  }

  const driveFolderLink = gdriveFolderId ? `https://drive.google.com/drive/folders/${gdriveFolderId}` : null;
  const quickCopyFields = [
    { key: "email", label: "Email", value: selectedProfileData.email, iconUrl: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
    { key: "phone", label: "Phone", value: selectedProfileData.phone, iconUrl: "https://img.icons8.com/color/96/iphone-x.png" },
    { key: "location", label: "Address", value: selectedProfileData.location, iconUrl: "https://img.icons8.com/color/96/google-maps-new.png" },
    { key: "postalCode", label: "Postal Code", value: selectedProfileData.postalCode, icon: "✉️" },
    { key: "lastCompany", label: "Last Company", value: getLastCompany(), icon: "🏢" },
    { key: "lastRole", label: "Last Role", value: getLastRole(), iconUrl: "https://img.icons8.com/color/96/employee-card.png" },
    { key: "linkedin", label: "LinkedIn", value: selectedProfileData.linkedin, iconUrl: "https://www.linkedin.com/favicon.ico" },
    { key: "github", label: "GitHub", value: selectedProfileData.github, iconUrl: "https://github.com/favicon.ico" },
    ...(driveFolderLink
      ? [
          {
            key: "driveLink",
            label: "Google Drive",
            value: driveFolderLink,
            iconUrl: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
            alwaysShow: true,
          },
        ]
      : []),
  ].filter((field) => field.value || field.alwaysShow);

  const displayName = selectedProfileData.name || profileResumeFileName;
  const profileTitle = selectedProfileData.title || "—";
  const profileReviewFormatted = formatProfileForReview(selectedProfileData);
  const profileReviewJson = profileToPrettyJson(selectedProfileData);

  const dropdownPanelStyle = (fixedStyle) => ({
    ...fixedStyle,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 8,
    boxShadow: theme === "dark" ? "0 12px 40px rgba(0,0,0,0.45)" : "0 8px 24px rgba(15,23,42,0.12)",
  });

  const iconBtn = (active = false) => ({
    ...ICON_BTN,
    background: active ? colors.copyBg : colors.inputBg,
    border: `1px solid ${active ? colors.infoText : colors.inputBorder}`,
    color: colors.text,
  });

  const toggleRow = (label, checked, onChange, keyLs) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}
    >
      <span style={{ fontSize: 13, color: colors.text }}>{label}</span>
      <button
        type="button"
        onClick={() => {
          const next = !checked;
          onChange(next);
          writeBoolLs(keyLs, next);
        }}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          background: checked ? colors.buttonBg : colors.inputBorder,
          position: "relative",
          flexShrink: 0,
        }}
        aria-pressed={checked}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 22 : 4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>Manual Job Apply — {displayName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content={`Manual resume and prompts for ${displayName}`} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
          padding: "clamp(12px, 3vw, 20px)",
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        <div style={{ maxWidth: "min(1200px, 100%)", margin: "0 auto", width: "100%" }}>
          {/* 1. Header */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: "700", margin: "0 0 6px 0" }}>{displayName}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>
                    Profile: <span style={{ color: colors.text, fontWeight: 600 }}>{profileTitle}</span>
                  </span>
                  <div style={{ position: "relative" }} ref={profileMenuRef}>
                    <button
                      type="button"
                      title="Profile options"
                      aria-label="Profile options"
                      onClick={() => {
                        setProfileMenuOpen((o) => !o);
                        setHelpOpen(false);
                        setSettingsOpen(false);
                      }}
                      style={iconBtn(profileMenuOpen)}
                    >
                      ⋮
                    </button>
                    {profileMenuOpen && (
                      <div style={{ ...dropdownPanelStyle(profileMenuDropdownStyle), padding: "6px 0" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileReviewOpen(true);
                            setProfileMenuOpen(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "10px 14px",
                            fontSize: 13,
                            background: "transparent",
                            border: "none",
                            color: colors.text,
                            cursor: "pointer",
                          }}
                        >
                          Review profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{ position: "relative" }} ref={helpRef}>
                  <button
                    type="button"
                    title="Help"
                    aria-label="Help"
                    onClick={() => {
                      setHelpOpen((o) => !o);
                      setSettingsOpen(false);
                      setProfileMenuOpen(false);
                    }}
                    style={iconBtn(helpOpen)}
                  >
                    ?
                  </button>
                  {helpOpen && (
                    <div
                      style={{
                        ...dropdownPanelStyle(helpDropdownStyle),
                        padding: "12px 14px",
                        maxHeight: "min(70vh, 480px)",
                        overflowY: "auto",
                      }}
                    >
                      <HelpGuideContent colors={colors} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                  style={iconBtn()}
                >
                  {theme === "dark" ? "☀" : "☾"}
                </button>
                <div style={{ position: "relative" }} ref={settingsRef}>
                  <button
                    type="button"
                    title="Settings"
                    aria-label="Settings"
                    onClick={() => {
                      setSettingsOpen((o) => !o);
                      setHelpOpen(false);
                      setProfileMenuOpen(false);
                    }}
                    style={iconBtn(settingsOpen)}
                    aria-expanded={settingsOpen}
                    aria-haspopup="true"
                  >
                    ⚙
                  </button>
                  {settingsOpen && (
                    <div style={{ ...dropdownPanelStyle(settingsDropdownStyle), padding: "4px 12px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, padding: "10px 0 4px", textTransform: "uppercase" }}>
                        Panels
                      </div>
                      {toggleRow("Quick copy panel", showQuickCopyPanel, setShowQuickCopyPanel, LS.quickCopy)}
                      {toggleRow("Preview section (prompt + template)", showPreviewSection, setShowPreviewSection, LS.preview)}
                      {toggleRow("Screening / 2nd prompts section", showScreeningSection, setShowScreeningSection, LS.screening)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Main form */}
          <div style={cardStyle}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 12, textTransform: "uppercase" }}>
              Application details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Role title (required)</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  style={{
                    ...inputStyle,
                    borderColor: roleName.trim() ? colors.inputBorder : colors.infoText,
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>Company name (required)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Used in prompts and PDF filename"
                  style={{
                    ...inputStyle,
                    borderColor: companyName.trim() ? colors.inputBorder : colors.infoText,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
                gap: 20,
                alignItems: "stretch",
              }}
            >
              {/* Left column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase" }}>
                    Step 1 — ATS resume prompt
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={handleCopyAtsPrompt}
                      disabled={!jd.trim() || !roleName.trim() || !companyName.trim()}
                      style={{
                        padding: "10px 14px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: colors.buttonText,
                        background: !jd.trim() || !roleName.trim() || !companyName.trim() ? colors.buttonDisabled : colors.buttonBg,
                        border: "none",
                        borderRadius: "6px",
                        cursor: !jd.trim() || !roleName.trim() || !companyName.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      Copy ATS prompt
                    </button>
                    <select
                      value={selectedAtsPrompt}
                      onChange={(e) => setSelectedAtsPrompt(e.target.value)}
                      style={{ ...inputStyle, maxWidth: "100%", width: "auto", minWidth: 160, cursor: "pointer" }}
                    >
                      {(atsPromptOptions.length ? atsPromptOptions : [selectedAtsPrompt]).map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => manualPrompt && copyToClipboard(manualPrompt, "manualPrompt")}
                      disabled={!manualPrompt.trim()}
                      style={{
                        padding: "10px 12px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: colors.text,
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: "6px",
                        cursor: !manualPrompt.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {copiedField === "manualPrompt" ? "Copied" : "Copy again"}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Job description</label>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the full job description…"
                    rows={10}
                    style={{
                      ...inputStyle,
                      fontFamily: "inherit",
                      resize: "vertical",
                      minHeight: 160,
                      lineHeight: 1.5,
                      background: colors.textareaBg,
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Employer / application questions (optional)</label>
                  <textarea
                    value={applicationQuestions}
                    onChange={(e) => setApplicationQuestions(e.target.value)}
                    placeholder="Screening questions, form fields, or notes — included in ATS context and in step 3 prompts."
                    rows={4}
                    style={{
                      ...inputStyle,
                      fontFamily: "inherit",
                      resize: "vertical",
                      minHeight: 88,
                      lineHeight: 1.45,
                      background: colors.textareaBg,
                    }}
                  />
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase" }}>
                    Step 2 — PDF
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={handleManualGenerate}
                      disabled={disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim()}
                      style={{
                        padding: "10px 14px",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: colors.buttonText,
                        background:
                          disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim()
                            ? colors.buttonDisabled
                            : colors.buttonBg,
                        border: "none",
                        borderRadius: "6px",
                        cursor:
                          disable || !roleName.trim() || !companyName.trim() || !pastedContent.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {disable ? `Generating… (${elapsedTime}s)` : "Download resume PDF"}
                    </button>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      style={{ ...inputStyle, maxWidth: "100%", width: "auto", minWidth: 200, cursor: "pointer" }}
                    >
                      {templateOptions.length === 0 && (
                        <option value={selectedTemplate}>{selectedTemplate}</option>
                      )}
                      {templateOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <label style={labelStyle}>Paste ChatGPT resume JSON</label>
                  <textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="Paste JSON only output from ChatGPT (markdown fences are OK)."
                    rows={14}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      minHeight: 260,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      lineHeight: 1.45,
                      resize: "vertical",
                      background: colors.textareaBg,
                    }}
                  />
                </div>

                {lastGenerationTime != null && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: colors.successBg,
                      border: `1px solid ${colors.successText}`,
                      borderRadius: "6px",
                      color: colors.successText,
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    PDF generated in {lastGenerationTime}s
                  </div>
                )}
              </div>
            </div>

            {promptError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: colors.errorBg,
                  border: `1px solid ${colors.errorText}`,
                  borderRadius: "6px",
                  color: colors.errorText,
                  fontSize: "12px",
                }}
              >
                {promptError}
              </div>
            )}
          </div>

          {/* 3. Preview */}
          {showPreviewSection && (
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 12, textTransform: "uppercase" }}>
                Preview
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                  gap: 16,
                  alignItems: "stretch",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>ATS prompt (editable)</div>
                  <textarea
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                    placeholder='Use "Copy ATS prompt" to generate, or edit before copying.'
                    rows={12}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "12px",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      color: colors.text,
                      background: colors.textareaBg,
                      border: `1px solid ${colors.inputBorder}`,
                      borderRadius: "6px",
                      outline: "none",
                      resize: "vertical",
                      minHeight: 220,
                      lineHeight: 1.45,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", minHeight: 220 }}>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                    Template PDF preview ({selectedTemplate})
                  </div>
                  <TemplatePdfMiniPreview
                    templateId={selectedTemplate}
                    colors={colors}
                    theme={theme}
                    miniHeight={220}
                    expanded={templatePreviewExpanded}
                    onToggleExpand={() => setTemplatePreviewExpanded((e) => !e)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Quick copy */}
          {showQuickCopyPanel && quickCopyFields.length > 0 && (
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 12, textTransform: "uppercase" }}>
                Quick copy panel
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(72px, calc(50% - 6px)), 1fr))",
                  gap: "8px",
                }}
              >
                {quickCopyFields.map(({ key, label, value, icon, iconUrl }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => copyToClipboard(value, key)}
                    style={{
                      padding: "clamp(6px, 1.5vw, 8px) 6px",
                      background: copiedField === key ? colors.copyBg : colors.inputBg,
                      border: `1px solid ${copiedField === key ? colors.infoText : colors.inputBorder}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      minHeight: "56px",
                      justifyContent: "center",
                    }}
                  >
                    {iconUrl ? (
                      <img src={iconUrl} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 16 }}>{icon}</span>
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: copiedField === key ? colors.successText : colors.textMuted,
                        textTransform: "uppercase",
                      }}
                    >
                      {copiedField === key ? "Copied" : label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Screening / second prompts */}
          {showScreeningSection && (
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 8, textTransform: "uppercase" }}>
                Step 3 — Second ChatGPT prompt
              </div>
              <p style={{ fontSize: 12, color: colors.textMuted, margin: "0 0 12px 0", lineHeight: 1.5 }}>
                Uses this job, company, role, profile JSON, pasted resume JSON, and optional questions. Edit the preview before copying if you
                want to tweak wording.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <select
                  value={selectedSecondPromptId}
                  onChange={(e) => setSelectedSecondPromptId(e.target.value)}
                  style={{ ...inputStyle, width: "auto", minWidth: 260, cursor: "pointer" }}
                >
                  {secondPromptCatalog.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleBuildSecondPrompt(true)}
                  disabled={!jd.trim() || !roleName.trim() || !companyName.trim()}
                  style={{
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: colors.buttonText,
                    background: !jd.trim() || !roleName.trim() || !companyName.trim() ? colors.buttonDisabled : colors.buttonBg,
                    border: "none",
                    borderRadius: "6px",
                    cursor: !jd.trim() || !roleName.trim() || !companyName.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Build &amp; copy prompt
                </button>
                <button
                  type="button"
                  onClick={() => handleBuildSecondPrompt(false)}
                  disabled={!jd.trim() || !roleName.trim() || !companyName.trim()}
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: "6px",
                    cursor: !jd.trim() || !roleName.trim() || !companyName.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Build only
                </button>
                <button
                  type="button"
                  onClick={() => secondPromptBody && copyToClipboard(secondPromptBody, "secondPrompt")}
                  disabled={!secondPromptBody.trim()}
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: "6px",
                    cursor: !secondPromptBody.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {copiedField === "secondPrompt" ? "Copied" : "Copy preview"}
                </button>
              </div>
              {secondPromptCatalog.find((p) => p.id === selectedSecondPromptId)?.description && (
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>
                  {secondPromptCatalog.find((p) => p.id === selectedSecondPromptId).description}
                </div>
              )}
              {secondPromptError && (
                <div
                  style={{
                    marginBottom: 10,
                    padding: "10px 12px",
                    background: colors.errorBg,
                    border: `1px solid ${colors.errorText}`,
                    borderRadius: "6px",
                    color: colors.errorText,
                    fontSize: "12px",
                  }}
                >
                  {secondPromptError}
                </div>
              )}
              <label style={labelStyle}>Second prompt preview</label>
              <textarea
                value={secondPromptBody}
                onChange={(e) => setSecondPromptBody(e.target.value)}
                placeholder='Click "Build only" or "Build & copy" after step 1 fields are filled. Resume JSON defaults to {} if the paste area is empty.'
                rows={14}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "12px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  color: colors.text,
                  background: colors.textareaBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: "6px",
                  outline: "none",
                  resize: "vertical",
                  minHeight: 240,
                  lineHeight: 1.45,
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {profileReviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Review profile"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setProfileReviewOpen(false)}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              maxHeight: "min(85vh, 720px)",
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: theme === "dark" ? "0 24px 64px rgba(0,0,0,0.5)" : "0 16px 48px rgba(15,23,42,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderBottom: `1px solid ${colors.cardBorder}`,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15 }}>Review profile — {displayName}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setProfileReviewMode("formatted")}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `1px solid ${profileReviewMode === "formatted" ? colors.infoText : colors.inputBorder}`,
                    background: profileReviewMode === "formatted" ? colors.copyBg : colors.inputBg,
                    color: colors.text,
                    cursor: "pointer",
                  }}
                >
                  Parsed
                </button>
                <button
                  type="button"
                  onClick={() => setProfileReviewMode("json")}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `1px solid ${profileReviewMode === "json" ? colors.infoText : colors.inputBorder}`,
                    background: profileReviewMode === "json" ? colors.copyBg : colors.inputBg,
                    color: colors.text,
                    cursor: "pointer",
                  }}
                >
                  Raw JSON
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      profileReviewMode === "json" ? profileReviewJson : profileReviewFormatted,
                      "profileReview"
                    )
                  }
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `1px solid ${colors.inputBorder}`,
                    background: colors.inputBg,
                    color: colors.text,
                    cursor: "pointer",
                  }}
                >
                  {copiedField === "profileReview" ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileReviewOpen(false)}
                  style={{
                    padding: "6px 10px",
                    fontSize: 14,
                    borderRadius: 6,
                    border: `1px solid ${colors.inputBorder}`,
                    background: colors.inputBg,
                    color: colors.text,
                    cursor: "pointer",
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={profileReviewMode === "json" ? profileReviewJson : profileReviewFormatted}
              style={{
                flex: 1,
                minHeight: 320,
                padding: "12px 14px",
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                color: colors.text,
                background: colors.textareaBg,
                border: "none",
                outline: "none",
                resize: "none",
                lineHeight: 1.45,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
