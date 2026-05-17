import { slugToProfileName } from "../profile-template-mapping";
import { API_ROUTES } from "../workflows/constants";
import { warmProfileCaches } from "./client-cache.js";

let debounceTimer = null;

/**
 * Debounced Next.js route + API warm-up while typing a profile id on login.
 */
export function scheduleProfilePrefetch(router, slug, { delayMs = 350 } = {}) {
  clearTimeout(debounceTimer);
  const trimmed = String(slug || "").trim();
  if (!trimmed) return;

  debounceTimer = setTimeout(() => {
    router.prefetch(`/manual/${trimmed}`);
    const basename = slugToProfileName(trimmed);
    if (basename) {
      warmProfileCaches(
        basename,
        API_ROUTES.profileByBasename(basename),
        API_ROUTES.CONFIG
      );
    }
  }, delayMs);
}

export function cancelProfilePrefetch() {
  clearTimeout(debounceTimer);
}
