/** Display size in QuickCopyGrid (assets are 48×48 source art in public/icons/). */
export const QUICK_COPY_ICON_PX = 22;

/** Bump when replacing files in public/icons/ (cache-bust). */
export const QUICK_COPY_ICON_VERSION = 5;

/**
 * @param {string} path e.g. "/icons/email.webp"
 * @returns {string}
 */
export function quickCopyIconSrc(path) {
  if (!path) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${QUICK_COPY_ICON_VERSION}`;
}

/**
 * Quick-copy icons in public/icons/
 *
 * - `render: "img"` (default) — full-color WebP/PNG/SVG via <img> (Gmail red, Maps pin, etc.).
 * - `render: "mask"` — monochrome SVG only; shape tinted with theme text color.
 *
 * Do not use mask on colorful rasters — they become solid color blocks.
 */
export const QUICK_COPY_ICONS = Object.freeze({
  email: { src: "/icons/email.webp", emoji: "✉️" },
  phone: { src: "/icons/phone.webp", emoji: "📱" },
  location: { src: "/icons/location.webp", emoji: "📍" },
  address: { src: "/icons/address.webp", emoji: "🏠" },
  lastRole: { src: "/icons/role.webp", emoji: "💼" },
  linkedin: { src: "/icons/linkedin.webp", emoji: "in" },
  github: { src: "/icons/github.svg", render: "mask", emoji: "⌨" },
  website: { src: "/icons/website.svg", render: "mask", emoji: "🌐" },
  portfolio: { src: "/icons/portfolio.svg", render: "mask", emoji: "👤" },
  driveLink: { src: "/icons/drive.webp", emoji: "📁" },
});
