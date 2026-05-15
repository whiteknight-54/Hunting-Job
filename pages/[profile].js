import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

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
      <title>Redirecting…</title>
    </Head>
  );
}
