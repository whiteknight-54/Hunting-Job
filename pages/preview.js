import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function PreviewPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Preview a template
  const previewTemplate = (templateId) => {
    const previewUrl = `/api/preview?template=${encodeURIComponent(templateId)}`;
    window.open(previewUrl, "_blank");
  };

  // Theme colors
  const themeColors = {
    dark: {
      bg: "#0f172a",
      cardBg: "#1e293b",
      cardBorder: "#334155",
      text: "#f1f5f9",
      textSecondary: "#cbd5e1",
      textMuted: "#94a3b8",
      buttonBg: "#3b82f6",
      buttonHover: "#2563eb",
      buttonText: "#ffffff",
      buttonDisabled: "#475569",
    },
    light: {
      bg: "#ffffff",
      cardBg: "#ffffff",
      cardBorder: "#e2e8f0",
      text: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#64748b",
      buttonBg: "#3b82f6",
      buttonHover: "#2563eb",
      buttonText: "#ffffff",
      buttonDisabled: "#cbd5e1",
    }
  };

  const colors = themeColors[theme];

  return (
    <>
      <Head>
        <title>Resume Template Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        padding: "20px",
        transition: "background 0.3s ease, color 0.3s ease"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "600",
                color: colors.text,
                margin: "0 0 8px 0"
              }}>
                Resume Template Preview
              </h1>
              <p style={{
                fontSize: "14px",
                color: colors.textSecondary,
                margin: 0
              }}>
                Preview all available resume templates with sample data
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  background: "transparent",
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "8px",
                  color: colors.text,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.cardBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ← Back
              </button>
              <button
                onClick={toggleTheme}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  background: "transparent",
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "8px",
                  color: colors.text,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.cardBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: colors.textSecondary
            }}>
              Loading templates...
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px"
            }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    background: colors.cardBg,
                    borderRadius: "12px",
                    border: `1px solid ${colors.cardBorder}`,
                    padding: "20px",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.buttonBg;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = theme === 'dark' 
                      ? "0 4px 12px rgba(59, 130, 246, 0.2)" 
                      : "0 2px 8px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.cardBorder;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: colors.text,
                    margin: "0 0 8px 0"
                  }}>
                    {template.name}
                  </h3>
                  <p style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                    margin: "0 0 16px 0",
                    flex: 1
                  }}>
                    {template.id === "Resume" 
                      ? "Classic default template with clean design"
                      : `Modern ${template.name.toLowerCase()} styled template`
                    }
                  </p>
                  <button
                    onClick={() => previewTemplate(template.id)}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: colors.buttonText,
                      background: colors.buttonBg,
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.buttonHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.buttonBg;
                    }}
                  >
                    Preview PDF
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div style={{
            marginTop: "40px",
            padding: "20px",
            background: colors.cardBg,
            borderRadius: "12px",
            border: `1px solid ${colors.cardBorder}`
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              color: colors.text,
              margin: "0 0 12px 0"
            }}>
              How to Use
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: "20px",
              color: colors.textSecondary,
              fontSize: "14px",
              lineHeight: "1.8"
            }}>
              <li>Click "Preview PDF" on any template to see it with sample data</li>
              <li>The preview opens in a new tab/window</li>
              <li>All templates use the same sample resume data for comparison</li>
              <li>To use a template, select a profile and generate a resume</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
