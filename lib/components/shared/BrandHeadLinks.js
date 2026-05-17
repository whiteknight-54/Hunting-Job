import Head from "next/head";
import {
  SITE_FAVICON_HEIGHT,
  SITE_FAVICON_MIME,
  SITE_FAVICON_PATH,
  SITE_FAVICON_WIDTH,
  SITE_LOGO_MIME,
  SITE_LOGO_PATH,
} from "../../site-meta";

/**
 * Preload login hero logo (use only on `/` — ~24KB; skip on profile pages).
 */
export function LoginLogoPreload() {
  return (
    <Head>
      <link rel="preload" href={SITE_LOGO_PATH} as="image" type={SITE_LOGO_MIME} />
    </Head>
  );
}

/** Static link tags for _document (no next/head). */
export function brandDocumentHeadLinks() {
  return (
    <>
      <link rel="icon" href={SITE_FAVICON_PATH} type={SITE_FAVICON_MIME} sizes={`${SITE_FAVICON_WIDTH}x${SITE_FAVICON_HEIGHT}`} />
      <link rel="apple-touch-icon" href={SITE_LOGO_PATH} />
    </>
  );
}
