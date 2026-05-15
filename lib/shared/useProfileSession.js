import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { slugToProfileName } from "../profile-template-mapping";
import { getProfileLastTitle } from "../profile-format";
import { getThemeColors } from "../theme-tokens";
import { API_ROUTES } from "../workflows/constants";
import { buildQuickCopyFields } from "./quick-copy-fields";
import { copyTextToClipboard } from "./copy-to-clipboard";

/**
 * Shared profile page session: slug resolution, profile JSON load, theme, config, clipboard.
 * Used by both auto and manual workflows (Open/Closed — extended via workflow hooks).
 */
export function useProfileSession() {
  const router = useRouter();
  const { profile: profileSlug } = router.query;

  const [theme, setTheme] = useState("dark");
  const [profileData, setProfileData] = useState(null);
  const [profileBasename, setProfileBasename] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [gdriveFolderId, setGdriveFolderId] = useState(null);
  const [aiConfig, setAiConfig] = useState(null);

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "dark");
  }, []);

  useEffect(() => {
    fetch(API_ROUTES.CONFIG)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        setGdriveFolderId(d.gdriveFolderId || null);
        setAiConfig(d.ai || null);
      })
      .catch(() => {
        setGdriveFolderId(null);
        setAiConfig(null);
      });
  }, []);

  useEffect(() => {
    if (!profileSlug) return;

    setLoading(true);
    const basename = slugToProfileName(profileSlug);
    if (!basename) {
      router.push("/");
      return;
    }

    setProfileBasename(basename);

    const load = async () => {
      try {
        const res = await fetch(API_ROUTES.profileByBasename(basename));
        if (!res.ok) {
          router.push("/");
          return;
        }
        setProfileData(await res.json());
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(load, 100);
    return () => clearTimeout(t);
  }, [profileSlug, router]);

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
    aiConfig,
  };
}
