import { QUICK_COPY_ICONS } from "./quick-copy-icons.js";

/** All quick-copy icon URLs (for warm-up). */
export function allQuickCopyIconUrls() {
  return [...new Set(Object.values(QUICK_COPY_ICONS).map((e) => e.src).filter(Boolean))];
}

/** Warm browser cache for tile icons (no-op on server). */
export function preloadQuickCopyIcons(urls) {
  if (typeof window === "undefined") return;
  const list = [...new Set((urls || []).filter(Boolean))];
  for (const src of list) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }
}
