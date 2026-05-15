import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getThemeColors } from "../lib/theme-tokens";
import { APP_FONT_FAMILY } from "../lib/shared/fonts";

export default function Home() {
  const router = useRouter();
  const [profileSlug, setProfileSlug] = useState("");
  const [theme, setTheme] = useState("dark");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

  // Navigate to profile page
  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileSlug.trim()) {
      const slug = profileSlug.trim();
      router.push(`/${slug}`);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const colors = getThemeColors(theme);

  return (
    <>
      <Head>
        <title>Resume Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="AI-powered resume generator for ATS-optimized resumes" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: APP_FONT_FAMILY,
        padding: "12px",
        transition: "background 0.3s ease, color 0.3s ease"
      }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px)"
        }}>
          <div style={{
            width: "100%",
            background: colors.cardBg,
            borderRadius: "12px",
            border: `1px solid ${colors.cardBorder}`,
            padding: "clamp(20px, 5vw, 40px)",
            transition: "all 0.2s ease"
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "clamp(20px, 4vw, 32px)",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <h1 style={{
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: "600",
                color: colors.text,
                margin: 0
              }}>
                Resume Generator
              </h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push("/preview")}
                  style={{
                    padding: "6px 12px",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    background: "transparent",
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: "6px",
                    color: colors.text,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.inputBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  📄 Preview
                </button>
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: "6px 12px",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    background: "transparent",
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: "6px",
                    color: colors.text,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
              </div>
            </div>

            {/* Profile Slug Input */}
            <form onSubmit={handleSubmit} style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "clamp(13px, 3vw, 15px)",
                  fontWeight: "400",
                  color: colors.textSecondary,
                  marginBottom: "8px"
                }}>
                  Enter Profile ID
                </label>
                <input
                  type="text"
                  value={profileSlug}
                  onChange={(e) => setProfileSlug(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px)",
                    fontSize: "clamp(14px, 3.5vw, 16px)",
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: "8px",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.buttonBg;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.inputBorder;
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!profileSlug.trim()}
                style={{
                  width: "100%",
                  padding: "clamp(12px, 3vw, 14px) clamp(16px, 4vw, 24px)",
                  fontSize: "clamp(14px, 3.5vw, 16px)",
                  fontWeight: "500",
                  color: colors.buttonText,
                  background: profileSlug.trim() ? colors.buttonBg : colors.buttonDisabled,
                  border: "none",
                  borderRadius: "8px",
                  cursor: profileSlug.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
              >
                Go to Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
