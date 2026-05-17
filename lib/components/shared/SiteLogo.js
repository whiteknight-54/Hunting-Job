import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_PATH,
  SITE_LOGO_WIDTH,
} from "../../site-meta";

const DEFAULT_STYLE = {
  width: "clamp(44px, 11vw, 48px)",
  height: "clamp(44px, 11vw, 48px)",
  borderRadius: 10,
  objectFit: "contain",
  flexShrink: 0,
};

/**
 * App brand mark from /public/logo.webp.
 * @param {{ priority?: boolean, alt?: string, style?: object }} props
 *   priority — login LCP: preload + fetchPriority high + eager + sync decode
 */
export default function SiteLogo({ priority = false, alt = "BOC-E", style, ...rest }) {
  return (
    <img
      src={SITE_LOGO_PATH}
      alt={alt}
      width={SITE_LOGO_WIDTH}
      height={SITE_LOGO_HEIGHT}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      style={{ ...DEFAULT_STYLE, ...style }}
      {...rest}
    />
  );
}
