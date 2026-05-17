import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { SITE_TITLE } from "../lib/site-meta";

/** `/p1` → `/manual/p1` (default workflow). */
export default function ProfileRedirectPage() {
  const router = useRouter();
  const { profile } = router.query;

  useEffect(() => {
    if (!router.isReady || !profile) return;
    router.replace(`/manual/${profile}`);
  }, [router, profile]);

  return (
    <Head>
      <title>{SITE_TITLE}</title>
    </Head>
  );
}
