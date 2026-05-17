import Head from "next/head";
import { useManualWorkflow } from "../../lib/workflows/manual/useManualWorkflow";
import { PROFILE_PAGE_MAX_WIDTH_PX } from "../../lib/workflows/constants";
import ProfileLoadingGate from "../../lib/components/shared/ProfileLoadingGate";
import { APP_FONT_FAMILY } from "../../lib/shared/fonts";
import ManualHeader from "../../lib/components/manual/ManualHeader";
import ManualApplicationForm from "../../lib/components/manual/ManualApplicationForm";
import dynamic from "next/dynamic";

const ManualPreviewSection = dynamic(
  () => import("../../lib/components/manual/ManualPreviewSection"),
  { ssr: false }
);
const ManualScreeningSection = dynamic(
  () => import("../../lib/components/manual/ManualScreeningSection"),
  { ssr: false }
);
const ManualModals = dynamic(() => import("../../lib/components/manual/ManualModals"), { ssr: false });

export default function ManualProfilePage() {
  const page = useManualWorkflow();
  const {
    ready,
    loaded,
    colors,
    displayName,
    showAtsPromptPreview,
    showPdfPreview,
    showScreeningSection,
    authError,
    bannerError,
  } = page;

  return (
    <ProfileLoadingGate ready={ready} loaded={loaded} colors={colors}>
      <Head>
        <title>Manual Job Apply — {displayName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content={`Manual resume and prompts for ${displayName}`} />
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
          <ManualHeader {...page} />
          {authError && (
            <div style={{ ...bannerError, marginBottom: 12 }}>{authError}</div>
          )}
          <ManualApplicationForm {...page} />
          {(showAtsPromptPreview || showPdfPreview) && <ManualPreviewSection {...page} />}
          {showScreeningSection && <ManualScreeningSection {...page} />}
        </div>
      </div>

      <ManualModals {...page} />
    </ProfileLoadingGate>
  );
}
