const LS_PREFIX = "profileOverride:";

function storageKey(profileSlug) {
  return `${LS_PREFIX}${profileSlug}`;
}

/** @returns {object | null} Parsed override or null if missing/invalid. */
export function readProfileOverride(profileSlug) {
  if (!profileSlug) return null;
  try {
    const raw = localStorage.getItem(storageKey(profileSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeProfileOverride(profileSlug, profileObject) {
  if (!profileSlug || !profileObject) return;
  try {
    localStorage.setItem(storageKey(profileSlug), JSON.stringify(profileObject));
  } catch {
    /* quota / private mode */
  }
}

export function clearProfileOverride(profileSlug) {
  if (!profileSlug) return;
  try {
    localStorage.removeItem(storageKey(profileSlug));
  } catch {
    /* ignore */
  }
}
