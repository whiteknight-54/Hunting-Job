/**
 * Browser sessionStorage cache for low-churn API responses.
 * Bump APP_DATA_VERSION on deploy when list/config shape changes.
 */
export const APP_DATA_VERSION = "1";

const TTL_MS = {
  config: 15 * 60 * 1000,
  templateList: 60 * 60 * 1000,
  atsPromptList: 60 * 60 * 1000,
  secondPromptList: 60 * 60 * 1000,
  profile: 30 * 60 * 1000,
};

function storageKey(kind) {
  return `hj_cache_${APP_DATA_VERSION}_${kind}`;
}

function ttlFor(kind) {
  if (kind in TTL_MS) return TTL_MS[kind];
  if (kind.startsWith("profile:")) return TTL_MS.profile;
  return 5 * 60 * 1000;
}

function readEntry(kind) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(kind));
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!at || Date.now() - at > ttlFor(kind)) {
      sessionStorage.removeItem(storageKey(kind));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeEntry(kind, data) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(kind), JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota — ignore */
  }
}

/** @param {string} url @param {{ kind: string, parse?: (r: Response) => Promise<any> }} opts */
export async function fetchCachedJson(url, { kind, parse }) {
  const cached = readEntry(kind);
  if (cached !== null) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  const data = parse ? await parse(res) : await res.json();
  writeEntry(kind, data);
  return data;
}

/** Profile JSON by basename — cached per profile for faster revisits. */
export async function fetchCachedProfile(basename, url) {
  const kind = `profile:${basename}`;
  const cached = readEntry(kind);
  if (cached !== null) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Profile not found: ${basename}`);
  const data = await res.json();
  writeEntry(kind, data);
  return data;
}

/** Warm profile + config caches without awaiting (login prefetch). */
export function warmProfileCaches(basename, profileUrl, configUrl = "/api/config") {
  if (!basename || !profileUrl) return;
  fetchCachedProfile(basename, profileUrl).catch(() => {});
  fetchCachedJson(configUrl, { kind: "config" }).catch(() => {});
}
