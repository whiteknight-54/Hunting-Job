import { useCallback, useEffect, useState } from "react";

export function useSlackSession() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    return fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        setUser(d?.authenticated && d?.user ? d.user : null);
        setLoaded(true);
        return d;
      })
      .catch(() => {
        setUser(null);
        setLoaded(true);
        return null;
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback((returnTo = "/") => {
    const path = typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : "/";
    window.location.href = `/api/auth/slack?returnTo=${encodeURIComponent(path)}`;
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  return {
    slackUser: user,
    slackSessionLoaded: loaded,
    slackAuthenticated: Boolean(user),
    refreshSlackSession: refresh,
    signInWithSlack: signIn,
    signOutSlack: signOut,
  };
}

export function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
