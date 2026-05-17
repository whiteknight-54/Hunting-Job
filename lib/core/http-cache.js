/** CDN-friendly cache for static list endpoints (prompt/template catalogs). */
const STATIC_LIST_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

/** Shorter cache for /api/config (Drive flags, AI key presence). */
const CONFIG_CACHE = "public, s-maxage=300, stale-while-revalidate=600";

/** Browser cache for profile JSON (auth still required; not shared on CDN). */
const PROFILE_PRIVATE_CACHE = "private, max-age=300, stale-while-revalidate=600";

export function setStaticListCacheHeaders(res) {
  res.setHeader("Cache-Control", STATIC_LIST_CACHE);
}

export function setConfigCacheHeaders(res) {
  res.setHeader("Cache-Control", CONFIG_CACHE);
}

export function setProfileCacheHeaders(res) {
  res.setHeader("Cache-Control", PROFILE_PRIVATE_CACHE);
}
