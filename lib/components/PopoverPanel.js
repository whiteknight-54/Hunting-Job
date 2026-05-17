import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MOBILE_BREAKPOINT = 640;

function computeAnchorLayout({
  anchorRect,
  vw,
  vh,
  maxWidth,
  pad,
  gapY,
  insetRight,
  alignRight,
}) {
  let w = Math.min(maxWidth, vw - pad * 2);
  let left;

  if (alignRight) {
    const targetRight = Math.min(anchorRect.right, vw - insetRight);
    left = targetRight - w;
    if (left < pad) {
      left = pad;
      w = Math.min(maxWidth, Math.max(160, targetRight - pad));
    }
    if (left + w > vw - pad) {
      w = Math.max(160, vw - pad - left);
    }
  } else {
    left = anchorRect.right - w;
    left = Math.max(pad, Math.min(left, vw - w - pad));
  }

  const spaceBelow = vh - anchorRect.bottom - pad;
  const spaceAbove = anchorRect.top - pad;
  const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
  const maxH = Math.min(520, preferBelow ? spaceBelow - gapY : spaceAbove - gapY, vh - pad * 2);

  let top;
  if (preferBelow) {
    top = anchorRect.bottom + gapY;
  } else {
    top = Math.max(pad, anchorRect.top - maxH - gapY);
  }

  return {
    position: "fixed",
    top,
    left,
    width: w,
    maxHeight: Math.max(160, maxH),
    zIndex: 1400,
    boxSizing: "border-box",
  };
}

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
  /** `"anchor"` = below/above gear; `"top"` = fixed below `topInsetVh`. */
  placement = "anchor",
  /** Used with `placement="top"`: distance from top of viewport in `vh` units. */
  topInsetVh = 10,
  /** Align panel right edge to anchor (and optional viewport inset). */
  alignRightToAnchor = false,
  /** @deprecated use alignRightToAnchor */
  alignTopRightToAnchor = false,
  /** Gap between anchor and panel (anchor placement). */
  anchorGapY = 10,
  /** Minimum distance from viewport right when alignRightToAnchor is true. */
  insetRightPx,
}) {
  const alignRight = alignRightToAnchor || alignTopRightToAnchor;
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
      const insetRight = insetRightPx ?? pad;
      const gapY = anchorGapY;
      const width = Math.min(maxWidth, vw - pad * 2);

      if (placement === "top") {
        const topPx = (vh * topInsetVh) / 100;
        const maxUsableW = vw - pad * 2;
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

        const el = alignRight ? anchorRef?.current : null;
        if (el) {
          const anchorRight = el.getBoundingClientRect().right;
          const targetRight = Math.min(anchorRight, vw - insetRight);
          let w = Math.min(maxWidth, maxUsableW);
          let left = targetRight - w;
          if (left < pad) {
            w = Math.min(maxWidth, maxUsableW, Math.max(targetRight - pad, 160));
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
            right: insetRight,
            width,
            maxHeight: `min(70vh, ${vh - pad * 2}px)`,
            zIndex: 1400,
            boxSizing: "border-box",
          },
        });
        return;
      }

      const r = el.getBoundingClientRect();
      setLayout({
        mode: "popover",
        backdrop: false,
        panel: computeAnchorLayout({
          anchorRect: r,
          vw,
          vh,
          maxWidth,
          pad,
          gapY,
          insetRight,
          alignRight,
        }),
      });
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, anchorRef, maxWidth, placement, topInsetVh, alignRight, anchorGapY, insetRightPx]);

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
