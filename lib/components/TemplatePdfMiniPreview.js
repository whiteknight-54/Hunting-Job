import { useEffect, useRef, useState } from "react";
import { tryParseTailoredResume } from "../tailored-resume/index.js";

const DOC_W = 816;
const DOC_H = 1056;
const DEBOUNCE_MS = 400;
const DEBOUNCE_LIVE_MS = 900;

/**
 * Template PDF preview — live when pasted JSON is valid, otherwise sample data.
 * Zoom in/out only changes scale inside a fixed frame (panel height unchanged).
 */
export default function TemplatePdfMiniPreview({
  templateId,
  profileSlug,
  pastedContent = "",
  colors,
  theme,
  fillParent = true,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.25);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scrollSize, setScrollSize] = useState({ w: DOC_W, h: DOC_H });
  const [iframeSrc, setIframeSrc] = useState("");
  const [previewMode, setPreviewMode] = useState("sample");
  const [loading, setLoading] = useState(false);
  const [zoomExpanded, setZoomExpanded] = useState(false);
  const blobUrlRef = useRef(null);
  const previewRequestIdRef = useRef(0);

  const setPreviewFromResponse = async (res, requestId) => {
    if (requestId !== previewRequestIdRef.current) return false;

    const mode = res.headers.get("X-Preview-Mode") === "live" ? "live" : "sample";
    const blob = await res.blob();
    if (requestId !== previewRequestIdRef.current) return false;

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    setIframeSrc(url);
    setPreviewMode(mode);
    return true;
  };

  const fetchPreviewPdf = (body, signal) =>
    fetch("/api/manual_preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

  useEffect(() => {
    if (!templateId || !profileSlug) {
      setIframeSrc("");
      return;
    }

    const controller = new AbortController();
    const debounceMs = tryParseTailoredResume(pastedContent) ? DEBOUNCE_LIVE_MS : DEBOUNCE_MS;
    const timer = setTimeout(async () => {
      const requestId = ++previewRequestIdRef.current;
      setLoading(true);

      const previewBody = {
        profile: profileSlug,
        template: templateId,
        content: pastedContent || "",
      };

      try {
        const res = await fetchPreviewPdf(previewBody, controller.signal);
        if (!res.ok) throw new Error("Preview failed");
        await setPreviewFromResponse(res, requestId);
      } catch (e) {
        if (e.name === "AbortError" || requestId !== previewRequestIdRef.current) return;

        try {
          const fallbackRes = await fetchPreviewPdf(
            { profile: profileSlug, template: templateId, content: "" },
            controller.signal
          );
          if (fallbackRes.ok) {
            await setPreviewFromResponse(fallbackRes, requestId);
            return;
          }
        } catch (fallbackErr) {
          if (fallbackErr.name === "AbortError" || requestId !== previewRequestIdRef.current) return;
        }

        if (requestId !== previewRequestIdRef.current) return;
        setIframeSrc(`/api/preview?template=${encodeURIComponent(templateId)}`);
        setPreviewMode("sample");
      } finally {
        if (requestId === previewRequestIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [templateId, profileSlug, pastedContent]);

  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;

      if (zoomExpanded) {
        const s = w / DOC_W;
        setScale(s);
        setOffset({ x: 0, y: 0 });
        setScrollSize({ w: DOC_W * s, h: DOC_H * s });
      } else {
        const s = Math.min(w / DOC_W, h / DOC_H);
        setScale(s);
        setOffset({
          x: Math.max(0, (w - DOC_W * s) / 2),
          y: Math.max(0, (h - DOC_H * s) / 2),
        });
        setScrollSize({ w: DOC_W, h: DOC_H });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [templateId, iframeSrc, zoomExpanded]);

  const toolbarBtn = {
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 5,
    border: `1px solid ${colors.inputBorder}`,
    background: colors.inputBg,
    color: colors.text,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: fillParent ? 1 : undefined,
        minHeight: fillParent ? 0 : 200,
        height: fillParent ? "100%" : undefined,
      }}
    >
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          borderRadius: 8,
          overflow: zoomExpanded ? "auto" : "hidden",
          border: `1px solid ${colors.inputBorder}`,
          background: theme === "dark" ? "#0f172a" : "#f8fafc",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={() => setZoomExpanded((z) => !z)}
          style={{
            ...toolbarBtn,
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 4,
            borderColor: zoomExpanded ? colors.infoText : colors.inputBorder,
            background: zoomExpanded ? colors.copyBg : colors.inputBg,
            boxShadow: theme === "dark" ? "0 1px 4px rgba(0,0,0,0.35)" : "0 1px 4px rgba(0,0,0,0.08)",
          }}
          title={zoomExpanded ? "Fit full page in frame" : "Zoom to width (scroll inside frame)"}
        >
          {zoomExpanded ? "⊟ Fit page" : "⊞ Zoom in"}
        </button>

        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme === "dark" ? "rgba(15,23,42,0.7)" : "rgba(248,250,252,0.85)",
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            Updating preview…
          </div>
        )}

        {iframeSrc ? (
          zoomExpanded ? (
            <div style={{ width: scrollSize.w, height: scrollSize.h }}>
              <iframe
                title={`Template preview ${templateId}`}
                src={iframeSrc}
                style={{
                  width: DOC_W,
                  height: DOC_H,
                  border: "none",
                  display: "block",
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                top: offset.y,
                left: offset.x,
                width: DOC_W,
                height: DOC_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <iframe
                title={`Template preview ${templateId}`}
                src={iframeSrc}
                style={{ width: DOC_W, height: DOC_H, border: "none", display: "block" }}
              />
            </div>
          )
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.textMuted,
              fontSize: 13,
            }}
          >
            Select a template.
          </div>
        )}

        {iframeSrc && !loading && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 3,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              padding: "4px 8px",
              borderRadius: 4,
              background: previewMode === "live" ? colors.successBg : colors.infoBg,
              color: previewMode === "live" ? colors.successText : colors.infoText,
              border: `1px solid ${previewMode === "live" ? colors.successText : colors.infoText}`,
              pointerEvents: "none",
            }}
          >
            {previewMode === "live" ? "Your resume" : "Sample data"}
          </div>
        )}
      </div>
    </div>
  );
}
