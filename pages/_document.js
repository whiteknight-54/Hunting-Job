import { Html, Head, Main, NextScript } from "next/document";
import { SITE_ICON_PATH, SITE_TITLE } from "../lib/site-meta";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href={SITE_ICON_PATH} type="image/png" />
        <link rel="apple-touch-icon" href={SITE_ICON_PATH} />
        <meta name="application-name" content={SITE_TITLE} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
