import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/router";
import { slugToProfileName } from "../profile-template-mapping";
import { getProfileLastTitle } from "../profile-format";
import { getThemeColors } from "../theme-tokens";
import { API_ROUTES } from "../workflows/constants";
import { buildQuickCopyFields } from "./quick-copy-fields";
import { copyTextToClipboard } from "./copy-to-clipboard";
import { buildGithubProfileFileUrl } from "./github-profiles-url";
import { messageForAuthError } from "./auth-error-messages";
import { useSlackSession } from "./useSlackSession";
import { fetchCachedJson, fetchCachedProfile } from "./client-cache.js";

/**
 * Shared profile page session: slug resolution, profile JSON load, theme, config, clipboard.
 * Used by both auto and manual workflows (Open/Closed — extended via workflow hooks).
 */
export function useProfileSession() {
  const router = useRouter();
  const { profile: profileSlug } = router.query;
  const { slackUser, signOutSlack } = useSlackSession();

  const [theme, setTheme] = useState("dark");
  const [profileData, setProfileData] = useState(null);
  const [profileBasename, setProfileBasename] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [gdriveFolderId, setGdriveFolderId] = useState(null);
  const [driveUploadEnabled, setDriveUploadEnabled] = useState(false);
  const [githubProfilesUrl, setGithubProfilesUrl] = useState(null);
  const [aiConfig, setAiConfig] = useState(null);
  const [migrationPromptBusy, setMigrationPromptBusy] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    startTransition(() => {
      if (stored === "light" || stored === "dark") setTheme(stored);
    });
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const code = router.query.auth_error;
    if (!code) return;
    const key = Array.isArray(code) ? code[0] : code;
    startTransition(() => setAuthError(messageForAuthError(key)));
  }, [router.isReady, router.query.auth_error]);

  useEffect(() => {
    if (!router.isReady || !profileSlug) return;

    const basename = slugToProfileName(profileSlug);
    if (!basename) {
      router.push("/");
      return;
    }

    setProfileBasename(basename);
    setLoading(true);

    let cancelled = false;

    const applyConfig = (d) => {
      if (!d) return;
      setGdriveFolderId(d?.gdriveFolderId || null);
      setDriveUploadEnabled(Boolean(d?.driveUploadEnabled));
      setGithubProfilesUrl(d?.githubProfilesUrl || null);
      setAiConfig(d?.ai || null);
    };

    const load = async () => {
      try {
        const profileUrl = API_ROUTES.profileByBasename(basename);
        const [data, configData] = await Promise.all([
          fetchCachedProfile(basename, profileUrl),
          fetchCachedJson(API_ROUTES.CONFIG, { kind: "config" }).catch(() => null),
        ]);
        if (cancelled) return;
        startTransition(() => {
          setProfileData(data);
          applyConfig(configData);
          setLoading(false);
        });
      } catch {
        if (!cancelled) router.push("/");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, profileSlug, router]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const copyToClipboard = async (text, fieldName) => {
    const ok = await copyTextToClipboard(text);
    if (!ok) return;
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const runProfileMigration = async () => {
    if (migrationPromptBusy) return;
    setMigrationPromptBusy(true);
    try {
      const res = await fetch(API_ROUTES.MIGRATION_PROMPT);
      if (!res.ok) throw new Error("Failed to load migration prompt");
      const { content } = await res.json();
      if (!content) throw new Error("Migration prompt is empty");
      await copyToClipboard(content, "migrationPrompt");
      const githubUrl = buildGithubProfileFileUrl(githubProfilesUrl, profileBasename);
      if (githubUrl) {
        window.open(githubUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Profile migration:", err);
    } finally {
      setMigrationPromptBusy(false);
    }
  };

  const colors = getThemeColors(theme);
  const quickCopyFields = buildQuickCopyFields(profileData, gdriveFolderId);
  const displayName = profileData?.name || profileBasename;
  const profileTitle = getProfileLastTitle(profileData) || "—";
  const ready = router.isReady && !!profileSlug;
  const loaded = !loading && !!profileData;

  return {
    router,
    profileSlug,
    profileBasename,
    profileData,
    loading,
    ready,
    loaded,
    theme,
    toggleTheme,
    colors,
    copiedField,
    copyToClipboard,
    quickCopyFields,
    displayName,
    profileTitle,
    gdriveFolderId,
    driveUploadEnabled,
    githubProfilesUrl,
    aiConfig,
    runProfileMigration,
    migrationPromptBusy,
    authError,
    slackUser,
    signOutSlack,
  };
}
