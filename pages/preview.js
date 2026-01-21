import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function PreviewPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [expandedTemplate, setExpandedTemplate] = useState(null);

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

  // Toggle expanded preview
  const togglePreview = (templateId) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="Preview all available resume templates with sample data" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        padding: "12px",
        transition: "background 0.3s ease, color 0.3s ease"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div>
              <h1 style={{
                fontSize: "clamp(20px, 4vw, 28px)",
                fontWeight: "600",
                color: colors.text,
                margin: "0 0 6px 0"
              }}>
                Resume Template Preview
              </h1>
              <p style={{
                fontSize: "clamp(12px, 2.5vw, 14px)",
                color: colors.textSecondary,
                margin: 0
              }}>
                Preview all available resume templates with sample data
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  background: "transparent",
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "6px",
                  color: colors.text,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
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
                  padding: "6px 12px",
                  fontSize: "13px",
                  background: "transparent",
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "6px",
                  color: colors.text,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
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
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
              gap: "20px"
            }}>
              {templates.map((template) => {
                const isExpanded = expandedTemplate === template.id;
                const previewUrl = `/api/preview?template=${encodeURIComponent(template.id)}`;
                
                return (
                  <div
                    key={template.id}
                    style={{
                      background: colors.cardBg,
                      borderRadius: "12px",
                      border: `1px solid ${colors.cardBorder}`,
                      padding: "16px",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.buttonBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.borderColor = colors.cardBorder;
                      }
                    }}
                  >
                    {/* Template Header */}
                    <div style={{ marginBottom: "12px" }}>
                      <h3 style={{
                        fontSize: "clamp(16px, 3vw, 18px)",
                        fontWeight: "600",
                        color: colors.text,
                        margin: "0 0 6px 0"
                      }}>
                        {template.name}
                      </h3>
                      <p style={{
                        fontSize: "12px",
                        color: colors.textMuted,
                        margin: 0
                      }}>
                        {template.id === "Resume" 
                          ? "Classic default template with clean design"
                          : `Modern ${template.name.toLowerCase()} styled template`
                        }
                      </p>
                    </div>

                    {/* Mini PDF Preview (Like Indeed) */}
                    <div style={{
                      width: "100%",
                      height: isExpanded ? "clamp(400px, 80vh, 600px)" : "200px",
                      marginBottom: "12px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: `1px solid ${colors.cardBorder}`,
                      background: theme === 'dark' ? "#1e293b" : "#f8f9fa",
                      transition: "height 0.3s ease",
                      position: "relative"
                    }}>
                      <div style={{
                        width: isExpanded ? "100%" : "400%",
                        height: isExpanded ? "100%" : "800px",
                        transform: isExpanded ? "scale(1)" : "scale(0.25)",
                        transformOrigin: "top left",
                        transition: "transform 0.3s ease",
                        pointerEvents: isExpanded ? "auto" : "none"
                      }}>
                        <iframe
                          src={previewUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            display: "block"
                          }}
                          title={`Preview of ${template.name}`}
                        />
                      </div>
                      {!isExpanded && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            cursor: "pointer",
                            background: "transparent",
                            zIndex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          onClick={() => togglePreview(template.id)}
                        >
                          <div style={{
                            background: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            opacity: 0,
                            transition: "opacity 0.2s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                          >
                            Click to expand
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: "flex",
                      gap: "8px",
                      flexDirection: "column"
                    }}>
                      <button
                        onClick={() => togglePreview(template.id)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: colors.buttonText,
                          background: isExpanded ? colors.textMuted : colors.buttonBg,
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded) {
                            e.currentTarget.style.background = colors.buttonHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) {
                            e.currentTarget.style.background = colors.buttonBg;
                          }
                        }}
                      >
                        {isExpanded ? "▼ Collapse Preview" : "▶ Expand Preview"}
                      </button>
                      <button
                        onClick={() => previewTemplate(template.id)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: colors.buttonText,
                          background: colors.buttonBg,
                          border: "none",
                          borderRadius: "6px",
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
                        📄 Open Full PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <div style={{
            marginTop: "32px",
            padding: "16px",
            background: colors.cardBg,
            borderRadius: "12px",
            border: `1px solid ${colors.cardBorder}`
          }}>
            <h3 style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: "600",
              color: colors.text,
              margin: "0 0 10px 0"
            }}>
              How to Use
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: "20px",
              color: colors.textSecondary,
              fontSize: "clamp(12px, 2.5vw, 14px)",
              lineHeight: "1.8"
            }}>
              <li>Click "Expand Preview" to see a larger preview of the template</li>
              <li>Click "Open Full PDF" to view the complete PDF in a new tab</li>
              <li>All templates use the same sample resume data for comparison</li>
              <li>To use a template, select a profile and generate a resume</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
