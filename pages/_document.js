import { Html, Head, Main, NextScript } from "next/document";
import { SITE_FAVICON_MIME, SITE_FAVICON_PATH, SITE_TITLE } from "../lib/site-meta";
import { brandDocumentHeadLinks } from "../lib/components/shared/BrandHeadLinks";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preload" href={SITE_FAVICON_PATH} as="image" type={SITE_FAVICON_MIME} />
        {brandDocumentHeadLinks()}
        <meta name="application-name" content={SITE_TITLE} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
