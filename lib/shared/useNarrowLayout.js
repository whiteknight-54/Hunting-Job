import { useEffect, useState } from "react";

export const NARROW_LAYOUT_BREAKPOINT = 640;

/** True when viewport is single-column / mobile width. */
export function useNarrowLayout(breakpoint = NARROW_LAYOUT_BREAKPOINT) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return narrow;
}
