import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MOBILE_BREAKPOINT = 640;

/**
 * Responsive popover: desktop = anchored panel; mobile = bottom sheet with backdrop.
 */
export default function PopoverPanel({
  open,
  onClose,
  anchorRef,
  children,
  maxWidth = 360,
  colors,
  theme,
  ariaLabel = "Panel",
  /** When `"top"`, panel is fixed below `topInsetVh` viewport height (e.g. settings gear on auto + manual). */
  placement = "anchor",
  /** Used with `placement="top"`: distance from top of viewport in `vh` units (default 10 = 10vh). */
  topInsetVh = 10,
  /**
   * With `placement="top"`: align panel **right** edge to anchor’s **right** (gear) when there is room;
   * on narrow viewports uses full width minus horizontal padding.
   */
  alignTopRightToAnchor = false,
}) {
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState({ mode: "closed", panel: {}, backdrop: false });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setLayout({ mode: "closed", panel: {}, backdrop: false });
      return;
    }

    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < MOBILE_BREAKPOINT;
      const pad = 12;
      const width = Math.min(maxWidth, vw - pad * 2);

      if (placement === "top") {
        const topPx = (vh * topInsetVh) / 100;
        const maxUsableW = vw - pad * 2;
        /** Viewport too narrow for `maxWidth` panel — full width for tap targets. */
        const useFullWidth = vw < MOBILE_BREAKPOINT || maxUsableW <= maxWidth;

        if (useFullWidth) {
          setLayout({
            mode: "popover",
            backdrop: false,
            panel: {
              position: "fixed",
              top: topPx,
              left: pad,
              width: maxUsableW,
              maxHeight: Math.max(160, vh - topPx - pad),
              zIndex: 1400,
              boxSizing: "border-box",
            },
          });
          return;
        }

        const el = alignTopRightToAnchor ? anchorRef?.current : null;
        if (el) {
          const anchorRight = el.getBoundingClientRect().right;
          let w = Math.min(maxWidth, maxUsableW);
          let left = anchorRight - w;
          if (left < pad) {
            w = Math.min(maxWidth, maxUsableW, Math.max(anchorRight - pad, 0));
            left = pad;
          }
          if (left + w > vw - pad) {
            w = Math.max(160, vw - pad - left);
          }
          if (w < 200) {
            setLayout({
              mode: "popover",
              backdrop: false,
              panel: {
                position: "fixed",
                top: topPx,
                left: pad,
                width: maxUsableW,
                maxHeight: Math.max(160, vh - topPx - pad),
                zIndex: 1400,
                boxSizing: "border-box",
              },
            });
            return;
          }
          setLayout({
            mode: "popover",
            backdrop: false,
            panel: {
              position: "fixed",
              top: topPx,
              left,
              width: w,
              maxHeight: Math.max(160, vh - topPx - pad),
              zIndex: 1400,
              boxSizing: "border-box",
            },
          });
          return;
        }

        const wCenter = Math.min(maxWidth, maxUsableW);
        const leftCenter = (vw - wCenter) / 2;
        setLayout({
          mode: "popover",
          backdrop: false,
          panel: {
            position: "fixed",
            top: topPx,
            left: leftCenter,
            width: wCenter,
            maxHeight: Math.max(160, vh - topPx - pad),
            zIndex: 1400,
            boxSizing: "border-box",
          },
        });
        return;
      }

      if (isMobile) {
        setLayout({
          mode: "sheet",
          backdrop: true,
          panel: {
            position: "fixed",
            left: pad,
            right: pad,
            bottom: pad,
            maxHeight: `min(85vh, ${vh - pad * 2}px)`,
            width: "auto",
            zIndex: 1400,
          },
        });
        return;
      }

      const el = anchorRef?.current;
      if (!el) {
        setLayout({
          mode: "popover",
          backdrop: false,
          panel: {
            position: "fixed",
            top: pad,
            right: pad,
            width,
            maxHeight: `min(70vh, ${vh - pad * 2}px)`,
            zIndex: 1400,
          },
        });
        return;
      }

      const r = el.getBoundingClientRect();
      let left = r.right - width;
      left = Math.max(pad, Math.min(left, vw - width - pad));

      const spaceBelow = vh - r.bottom - pad;
      const spaceAbove = r.top - pad;
      const preferBelow = spaceBelow >= 200 || spaceBelow >= spaceAbove;
      const maxH = Math.min(520, preferBelow ? spaceBelow - 8 : spaceAbove - 8, vh - pad * 2);

      let top;
      if (preferBelow) {
        top = r.bottom + 8;
      } else {
        top = Math.max(pad, r.top - maxH - 8);
      }

      setLayout({
        mode: "popover",
        backdrop: false,
        panel: {
          position: "fixed",
          top,
          left,
          width,
          maxHeight: Math.max(160, maxH),
          zIndex: 1400,
        },
      });
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [open, anchorRef, maxWidth, placement, topInsetVh, alignTopRightToAnchor]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || layout.backdrop) return;
    const onDown = (e) => {
      if (anchorRef?.current?.contains(e.target)) return;
      if (e.target.closest?.("[data-popover-panel]")) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, layout.mode, layout.backdrop, anchorRef, onClose]);

  if (!mounted || !open || layout.mode === "closed") return null;

  const panelStyle = {
    ...layout.panel,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: layout.mode === "sheet" ? 12 : 8,
    boxShadow: theme === "dark" ? "0 16px 48px rgba(0,0,0,0.5)" : "0 12px 32px rgba(15,23,42,0.15)",
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
  };

  return createPortal(
    <>
      {layout.backdrop && (
        <div
          role="presentation"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1350,
            background: colors.overlayBg,
          }}
        />
      )}
      <div role="dialog" aria-label={ariaLabel} data-popover-panel style={panelStyle}>
        {children}
      </div>
    </>,
    document.body
  );
}
