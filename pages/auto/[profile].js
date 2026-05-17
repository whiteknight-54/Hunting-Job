import Head from "next/head";
import { useAutoWorkflow } from "../../lib/workflows/auto/useAutoWorkflow";
import { PROFILE_PAGE_MAX_WIDTH_PX } from "../../lib/workflows/constants";
import ProfileLoadingGate from "../../lib/components/shared/ProfileLoadingGate";
import { APP_FONT_FAMILY } from "../../lib/shared/fonts";
import AutoHeader from "../../lib/components/auto/AutoHeader";
import AutoGenerateForm from "../../lib/components/auto/AutoGenerateForm";
import dynamic from "next/dynamic";

const AutoModals = dynamic(() => import("../../lib/components/auto/AutoModals"), { ssr: false });

export default function AutoProfilePage() {
  const page = useAutoWorkflow();
  const { ready, loaded, colors, displayName, authError, bannerError } = page;

  return (
    <ProfileLoadingGate ready={ready} loaded={loaded} colors={colors}>
      <Head>
        <title>Auto Apply — {displayName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content={`AI resume generation for ${displayName}`} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily: APP_FONT_FAMILY,
          padding: "clamp(12px, 3vw, 20px)",
          transition: "background 0.2s ease, color 0.2s ease",
        }}
      >
        <div style={{ maxWidth: `min(${PROFILE_PAGE_MAX_WIDTH_PX}px, 100%)`, margin: "0 auto", width: "100%" }}>
          <AutoHeader {...page} />
          {authError && (
            <div style={{ ...bannerError, marginBottom: 12 }}>{authError}</div>
          )}
          <AutoGenerateForm {...page} />
        </div>
      </div>

      <AutoModals {...page} />
    </ProfileLoadingGate>
  );
}
