import dynamic from "next/dynamic";

/** Slack account popover — loaded only when signed in (smaller login bundle). */
const LazySlackAccountMenu = dynamic(() => import("./SlackAccountMenu"), {
  ssr: false,
  loading: () => null,
});

export default LazySlackAccountMenu;
