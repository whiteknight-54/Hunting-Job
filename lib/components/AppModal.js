import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Centered modal with backdrop — used for help, profile review, etc.
 */
export default function AppModal({
  open,
  onClose,
  title,
  ariaLabel,
  colors,
  theme,
  maxWidth = 720,
  children,
  headerActions,
  bodyStyle,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
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

  if (!mounted || !open) return null;

  const closeBtn = {
    padding: "6px 10px",
    fontSize: 14,
    borderRadius: 6,
    border: `1px solid ${colors.inputBorder}`,
    background: colors.inputBg,
    color: colors.text,
    cursor: "pointer",
    lineHeight: 1,
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(15, 23, 42, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: `min(${maxWidth}px, 100%)`,
          maxHeight: "min(85vh, 720px)",
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: theme === "dark" ? "0 24px 64px rgba(0,0,0,0.5)" : "0 16px 48px rgba(15,23,42,0.15)",
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
          <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>{title}</div>
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
