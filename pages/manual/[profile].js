import { lazy, Suspense } from "react";
import Head from "next/head";
import { useManualPage } from "../../lib/manual/useManualPage";
import ProfileLoadingGate from "../../lib/components/shared/ProfileLoadingGate";
import ManualHeader from "../../lib/components/manual/ManualHeader";
import ManualApplicationForm from "../../lib/components/manual/ManualApplicationForm";
import ManualPreviewSection from "../../lib/components/manual/ManualPreviewSection";
import ManualQuickCopyPanel from "../../lib/components/manual/ManualQuickCopyPanel";
import ManualScreeningSection from "../../lib/components/manual/ManualScreeningSection";
import ManualModals from "../../lib/components/manual/ManualModals";

export default function ManualProfilePage() {
  const page = useManualPage();
  const { ready, loaded, colors, displayName, showPreviewSection, showQuickCopyPanel, showScreeningSection } = page;

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
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "clamp(12px, 3vw, 20px)",
        }}
      >
        <div style={{ maxWidth: "min(1200px, 100%)", margin: "0 auto", width: "100%" }}>
          <ManualHeader {...page} />
          <ManualApplicationForm {...page} />
          {showPreviewSection && <ManualPreviewSection {...page} />}
          {showQuickCopyPanel && <ManualQuickCopyPanel {...page} />}
          {showScreeningSection && <ManualScreeningSection {...page} />}
        </div>
      </div>

      <ManualModals {...page} />
    </ProfileLoadingGate>
  );
}
