import { loadProfileBySlug } from "./profile.js";

export function isProfileOverride(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Load profile from disk, or use client-provided temporary override when present. */
export async function resolveProfileForRequest(slug, profileOverride) {
  const loaded = await loadProfileBySlug(slug);
  if (isProfileOverride(profileOverride)) {
    return { ...loaded, data: profileOverride };
  }
  return loaded;
}
