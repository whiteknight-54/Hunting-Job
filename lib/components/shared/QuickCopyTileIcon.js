import { useState } from "react";
import { QUICK_COPY_ICON_PX } from "../../shared/quick-copy-icons.js";

/**
 * Monochrome SVG only — tints shape with theme text color.
 * Do not use on WebP or multi-color artwork (shows as a flat color square).
 */
function MaskedSvgIcon({ src, color, size }) {
  const mask = `url("${src}") center / contain no-repeat`;
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        display: "block",
        flexShrink: 0,
        backgroundColor: color || "currentColor",
        mask,
        WebkitMask: mask,
      }}
    />
  );
}

/**
 * Quick-copy tile icon — default <img> (full color). Optional mask for mono SVG.
 */
export default function QuickCopyTileIcon({
  iconUrl,
  icon,
  color,
  iconRender = "img",
  size = QUICK_COPY_ICON_PX,
}) {
  const [failed, setFailed] = useState(false);

  if (!iconUrl || failed) {
    return (
      <span style={{ fontSize: 16, lineHeight: 1, minHeight: size, display: "flex", alignItems: "center" }}>
        {icon || "•"}
      </span>
    );
  }

  if (iconRender === "mask") {
    return <MaskedSvgIcon src={iconUrl} color={color} size={size} />;
  }

  return (
    <img
      src={iconUrl}
      alt=""
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
