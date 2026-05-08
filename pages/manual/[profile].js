import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { slugToProfileName } from "../../lib/profile-template-mapping";

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
        ></div>
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

export default function ManualProfilePage() {
  const router = useRouter();
  const { profile: profileSlug } = router.query;

  const [jd, setJd] = useState("");
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [disable, setDisable] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastGenerationTime, setLastGenerationTime] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [gdriveFolderId, setGdriveFolderId] = useState(null);

  const [manualPrompt, setManualPrompt] = useState("");
  const [promptError, setPromptError] = useState(null);
  const [pastedContent, setPastedContent] = useState("");

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setGdriveFolderId(d.gdriveFolderId || null))
      .catch(() => setGdriveFolderId(null));
  }, []);

  useEffect(() => {
    if (!profileSlug) return;

    setLoading(true);
    const profileNameFromSlug = slugToProfileName(profileSlug);

    if (!profileNameFromSlug) {
      router.push("/");
      return;
    }

    setProfileName(profileNameFromSlug);

    const loadData = async () => {
      try {
        const response = await fetch(`/api/profiles/${encodeURIComponent(profileNameFromSlug)}`);
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
      textareaBg: "#1e293b",
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
      textareaBg: "#ffffff",
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

  const handleCopyPromptForChatGPT = async () => {
    if (!jd.trim()) {
      alert("Please enter a job description first");
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
        body: JSON.stringify({ profile: profileSlug, jd }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || (await response.text()) || "Failed to build prompt");
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

  const handleManualGenerate = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name");
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
          roleName: roleName.trim(),
          companyName: companyName.trim() || null,
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
      let filename = `${profileName?.replace(/\s+/g, "_") || profileSlug}.pdf`;
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

  if (!router.isReady || !profileSlug) {
    return (
      <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: colors.text }}>Loading...</div>}>
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

  return (
    <>
      <Head>
        <title>Manual Resume Generator - {profileName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content={`Manual resume generation for ${profileName}`} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
          padding: "clamp(12px, 3vw, 16px)",
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
          {/* Header Card */}
          <div
            style={{
              background: colors.cardBg,
              borderRadius: "8px",
              border: `1px solid ${colors.cardBorder}`,
              padding: "16px",
              marginBottom: "12px",
              boxShadow: theme === "dark" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <h1 style={{ fontSize: "clamp(16px, 4vw, 18px)", fontWeight: "600", margin: "0 0 2px 0" }}>
                  {profileName}
                </h1>
                <p style={{ fontSize: "clamp(11px, 2.5vw, 12px)", color: colors.textSecondary, margin: 0 }}>
                  Manual mode (no API key): copy prompt → paste ChatGPT JSON → generate PDF
                </p>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: "6px",
                  color: colors.text,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>

            {/* Quick Copy Buttons */}
            {quickCopyFields.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(70px, calc(50% - 4px)), 1fr))",
                  gap: "8px",
                  paddingTop: "12px",
                  borderTop: `1px solid ${colors.cardBorder}`,
                }}
              >
                {quickCopyFields.map(({ key, label, value, icon, iconUrl }) => (
                  <button
                    key={key}
                    onClick={() => copyToClipboard(value, key)}
                    style={{
                      padding: "clamp(6px, 1.5vw, 8px) clamp(4px, 1vw, 6px)",
                      background: copiedField === key ? colors.copyBg : colors.inputBg,
                      border: `1px solid ${copiedField === key ? colors.infoText : colors.inputBorder}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      minHeight: "clamp(50px, 12vw, 60px)",
                      justifyContent: "center",
                    }}
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        style={{ width: "clamp(18px, 4vw, 22px)", height: "clamp(18px, 4vw, 22px)", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}>{icon}</span>
                    )}
                    <div
                      style={{
                        fontSize: "clamp(9px, 2vw, 10px)",
                        fontWeight: "500",
                        color: copiedField === key ? colors.successText : colors.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {copiedField === key ? "Copied!" : label}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual cards */}
          <div
            style={{
              background: colors.cardBg,
              borderRadius: "8px",
              border: `1px solid ${colors.cardBorder}`,
              padding: "16px",
              boxShadow: theme === "dark" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "10px" }}>
              <button
                onClick={handleCopyPromptForChatGPT}
                disabled={!jd.trim()}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: colors.buttonText,
                  background: !jd.trim() ? colors.buttonDisabled : colors.buttonBg,
                  border: "none",
                  borderRadius: "6px",
                  cursor: !jd.trim() ? "not-allowed" : "pointer",
                }}
              >
                Copy prompt for ChatGPT
              </button>
              <button
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
                {copiedField === "manualPrompt" ? "Prompt copied" : "Copy last prompt again"}
              </button>
            </div>

            {promptError && (
              <div
                style={{
                  padding: "10px 12px",
                  background: colors.errorBg,
                  border: `1px solid ${colors.errorText}`,
                  borderRadius: "6px",
                  color: colors.errorText,
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                {promptError}
              </div>
            )}

            {/* Job Description */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "clamp(10px, 2.5vw, 11px)",
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                Job Description (used to build the prompt)
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                rows="10"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  color: colors.text,
                  background: colors.textareaBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: "6px",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "160px",
                  lineHeight: "1.5",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Role + Company */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "clamp(10px, 2.5vw, 11px)",
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  Role Name (required)
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${roleName.trim() ? colors.inputBorder : colors.infoText}`,
                    borderRadius: "6px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "clamp(10px, 2.5vw, 11px)",
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  Company Name (optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Used in filename"
                  style={{
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
                  }}
                />
              </div>
            </div>

            {/* Pasted JSON */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "clamp(10px, 2.5vw, 11px)",
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                Paste ChatGPT JSON output
              </label>
              <textarea
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder='Paste the JSON response here (including ```json fences is OK). Must include: title, summary, skills, experience.'
                rows="12"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  color: colors.text,
                  background: colors.textareaBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: "6px",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "220px",
                  lineHeight: "1.45",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              onClick={handleManualGenerate}
              disabled={disable || !roleName.trim() || !pastedContent.trim()}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: "700",
                color: colors.buttonText,
                background: disable || !roleName.trim() || !pastedContent.trim() ? colors.buttonDisabled : colors.buttonBg,
                border: "none",
                borderRadius: "6px",
                cursor: disable || !roleName.trim() || !pastedContent.trim() ? "not-allowed" : "pointer",
              }}
            >
              {disable ? `Generating PDF... (${elapsedTime}s)` : "Generate Resume PDF from pasted content"}
            </button>

            {lastGenerationTime && (
              <div
                style={{
                  padding: "10px 12px",
                  background: colors.successBg,
                  border: `1px solid ${colors.successText}`,
                  borderRadius: "6px",
                  color: colors.successText,
                  fontSize: "12px",
                  textAlign: "center",
                  fontWeight: "600",
                  marginTop: "12px",
                }}
              >
                ✓ PDF generated successfully in {lastGenerationTime}s
              </div>
            )}
          </div>

          {/* Prompt preview */}
          <div
            style={{
              background: colors.cardBg,
              borderRadius: "8px",
              border: `1px solid ${colors.cardBorder}`,
              padding: "16px",
              boxShadow: theme === "dark" ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                  Prompt preview
                </div>
                <div style={{ fontSize: "12px", color: colors.textMuted }}>
                  This is the exact prompt that gets copied to ChatGPT.
                </div>
              </div>
              <button
                onClick={() => manualPrompt && copyToClipboard(manualPrompt, "manualPrompt")}
                disabled={!manualPrompt.trim()}
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: colors.text,
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: "6px",
                  cursor: !manualPrompt.trim() ? "not-allowed" : "pointer",
                }}
              >
                {copiedField === "manualPrompt" ? "Copied" : "Copy"}
              </button>
            </div>

            <textarea
              value={manualPrompt}
              onChange={(e) => setManualPrompt(e.target.value)}
              placeholder="Click “Copy prompt for ChatGPT” to generate this."
              rows="10"
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "10px 12px",
                fontSize: "12px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                color: colors.text,
                background: colors.textareaBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: "6px",
                outline: "none",
                resize: "vertical",
                minHeight: "180px",
                lineHeight: "1.45",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

