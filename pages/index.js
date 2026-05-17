import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getThemeColors } from "../lib/theme-tokens";
import { APP_FONT_FAMILY } from "../lib/shared/fonts";
import { messageForAuthError } from "../lib/shared/auth-error-messages";
import { SITE_ICON_PATH, SITE_TITLE } from "../lib/site-meta";
import { useSlackSession } from "../lib/shared/useSlackSession";
import SlackLoginButton from "../lib/components/shared/SlackLoginButton";
import SlackAccountMenu from "../lib/components/shared/SlackAccountMenu";

function parseReturnTo(query) {
  const raw = query?.returnTo;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

export default function Home() {
  const router = useRouter();
  const [profileSlug, setProfileSlug] = useState("");
  const [theme, setTheme] = useState("dark");
  const [authError, setAuthError] = useState(null);
  const { slackUser, slackSessionLoaded, slackAuthenticated, signInWithSlack, signOutSlack } = useSlackSession();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    startTransition(() => setTheme(savedTheme));
  }, []);

  useEffect(() => {
    const code = router.query.auth_error;
    if (!code) return;
    const key = Array.isArray(code) ? code[0] : code;
    setAuthError(messageForAuthError(key));
  }, [router.query.auth_error]);

  useEffect(() => {
    if (!router.isReady || !slackAuthenticated) return;
    const returnTo = parseReturnTo(router.query);
    if (returnTo && returnTo !== "/") {
      router.replace(returnTo);
    }
  }, [router.isReady, slackAuthenticated, router.query.returnTo, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slackAuthenticated) return;
    if (profileSlug.trim()) router.push(`/${profileSlug.trim()}`);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const colors = getThemeColors(theme);
  const returnTo = parseReturnTo(router.query) || "/";
  const iconBtn = (active = false) => ({
    padding: "6px 10px",
    fontSize: 13,
    background: active ? colors.copyBg : "transparent",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 6,
    color: colors.text,
    cursor: "pointer",
  });

  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="ATS-tailored resumes for BOC-E — sign in with Slack" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily: APP_FONT_FAMILY,
          padding: "clamp(12px, 3vw, 20px)",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: "clamp(24px, 8vh, 64px)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: slackAuthenticated ? "space-between" : "flex-end",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              width: "100%",
            }}
          >
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" style={iconBtn()}>
              {theme === "dark" ? "☀" : "☾"}
            </button>
            {slackAuthenticated && (
              <SlackAccountMenu
                colors={colors}
                theme={theme}
                slackUser={slackUser}
                onSignOut={signOutSlack}
                iconBtn={iconBtn}
              />
            )}
          </div>

          <div
            style={{
              background: colors.cardBg,
              borderRadius: 16,
              border: `1px solid ${colors.cardBorder}`,
              padding: "clamp(28px, 6vw, 40px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(10px, 3vw, 14px)",
                marginBottom: 8,
              }}
            >
              <img
                src={SITE_ICON_PATH}
                alt=""
                width={48}
                height={48}
                style={{
                  width: "clamp(40px, 10vw, 48px)",
                  height: "clamp(40px, 10vw, 48px)",
                  borderRadius: 10,
                  objectFit: "cover",
                  flexShrink: 0,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              />
              <h1
                style={{
                  fontSize: "clamp(22px, 5vw, 28px)",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {SITE_TITLE}
              </h1>
            </div>
            <p
              style={{
                margin: "0 0 28px",
                fontSize: 14,
                lineHeight: 1.5,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Sign in with your BOC-E Slack account, then open a candidate profile.
            </p>

            {authError && (
              <div
                style={{
                  marginBottom: 20,
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: colors.errorText,
                  background: colors.errorBg,
                  border: `1px solid ${colors.errorText}`,
                }}
              >
                {authError}
              </div>
            )}

            {!slackSessionLoaded ? (
              <p style={{ textAlign: "center", color: colors.textMuted, fontSize: 14 }}>Checking session…</p>
            ) : !slackAuthenticated ? (
              <div style={{ marginBottom: 28 }}>
                <SlackLoginButton fullWidth onClick={() => signInWithSlack(returnTo)} />
              </div>
            ) : (
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: 13,
                  color: colors.successText,
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                Signed in as {slackUser?.name || "Slack user"}
              </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Profile ID
                </label>
                <input
                  type="text"
                  value={profileSlug}
                  onChange={(e) => setProfileSlug(e.target.value)}
                  disabled={!slackAuthenticated}
                  placeholder={slackAuthenticated ? "input profile id" : "Sign in with Slack first"}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    fontSize: 16,
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: 8,
                    outline: "none",
                    boxSizing: "border-box",
                    opacity: slackAuthenticated ? 1 : 0.65,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!slackAuthenticated || !profileSlug.trim()}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.buttonText,
                  background:
                    slackAuthenticated && profileSlug.trim() ? colors.buttonBg : colors.buttonDisabled,
                  border: "none",
                  borderRadius: 8,
                  cursor: slackAuthenticated && profileSlug.trim() ? "pointer" : "not-allowed",
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
