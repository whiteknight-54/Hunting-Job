import Head from "next/head";
import { useAutoWorkflow } from "../lib/workflows/auto/useAutoWorkflow";
import ProfileLoadingGate from "../lib/components/shared/ProfileLoadingGate";
import AutoHeader from "../lib/components/auto/AutoHeader";
import AutoGenerateForm from "../lib/components/auto/AutoGenerateForm";

export default function AutoProfilePage() {
  const page = useAutoWorkflow();
  const { ready, loaded, colors, theme, displayName, profileSlug } = page;

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
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "clamp(12px, 3vw, 20px)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <AutoHeader {...page} />
          <AutoGenerateForm {...page} />
        </div>
      </div>
    </ProfileLoadingGate>
  );
}
