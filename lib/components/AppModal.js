import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TOOLBAR_BTN_BASE } from "../workflows/manual/constants";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal with backdrop — used for help, profile review, etc.
 * Sits below `topInsetVh` from the top; panel width is capped by `maxWidth` and never overflows the viewport.
 */
export default function AppModal({
  open,
  onClose,
  title,
  ariaLabel,
  colors,
  theme,
  maxWidth = 720,
  /** Top offset as a percent of viewport height (default 10 ≈ 10vh). */
  topInsetVh = 10,
  children,
  headerActions,
  bodyStyle,
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const titleIdRef = useRef(`app-modal-title-${Math.random().toString(36).slice(2, 9)}`);
  const previousFocusRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    const t = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll(FOCUSABLE);
      if (focusable.length) focusable[0].focus();
      else panel.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) return;
    const prev = previousFocusRef.current;
    if (prev && typeof prev.focus === "function") {
      const t = setTimeout(() => prev.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted || !open) return null;

  const topInset = `${topInsetVh}vh`;
  const panelMaxW = `min(${maxWidth}px, calc(100vw - 32px))`;

  const closeBtn = {
    ...TOOLBAR_BTN_BASE,
    padding: "0 10px",
    fontSize: 14,
    borderRadius: 8,
    border: `1px solid ${colors.inputBorder}`,
    background: colors.inputBg,
    color: colors.text,
    cursor: "pointer",
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleIdRef.current}
      aria-label={ariaLabel || title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: colors.overlayBg,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: `${topInset} 16px 16px`,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
          width: panelMaxW,
          maxWidth: "100%",
          maxHeight: `min(calc(100vh - 32px - ${topInset}), 85vh)`,
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: theme === "dark" ? "0 24px 64px rgba(0,0,0,0.5)" : "0 16px 48px rgba(15,23,42,0.15)",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            padding: "12px 14px",
            borderBottom: `1px solid ${colors.cardBorder}`,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <div id={titleIdRef.current} style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
            {title}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {headerActions}
            <button type="button" onClick={onClose} style={closeBtn} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            ...bodyStyle,
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
