import Head from "next/head";
import "../styles/globals.css";
import { SITE_TITLE } from "../lib/site-meta";
import { Analytics } from "@vercel/analytics/next";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
