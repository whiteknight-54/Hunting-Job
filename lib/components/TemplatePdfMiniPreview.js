import { useEffect, useRef, useState } from "react";
import { parseApiError } from "../api-client";
import { validateTailoredJsonInput } from "../core/resume.js";
import { API_ROUTES } from "../workflows/constants";

const DOC_W = 816;
const DOC_H = 1056;
const DEBOUNCE_MS = 400;
const DEBOUNCE_LIVE_MS = 900;
const PDF_VIEW_PARAMS = "#toolbar=0&navpanes=0&scrollbar=0&view=FitH";

function withPdfViewParams(url) {
  if (!url) return url;
  return `${url.split("#")[0]}${PDF_VIEW_PARAMS}`;
}

/**
 * Template PDF preview — live when pasted JSON is valid, otherwise sample data.
 * Scales preview to panel width (100%); excess height is clipped.
 */
export default function TemplatePdfMiniPreview({
  templateId,
  profileSlug,
  profileJobCount = 0,
  pastedContent = "",
  showPhone = false,
  showLinkedin = true,
  colors,
  theme,
  fillParent = true,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.25);
  const [iframeSrc, setIframeSrc] = useState("");
  const [previewMode, setPreviewMode] = useState("sample");
  const [previewError, setPreviewError] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setIframeSrc(withPdfViewParams(url));
    setPreviewMode(mode);
    return true;
  };

  const fetchPreviewPdf = (body, signal) =>
    fetch(API_ROUTES.MANUAL_PREVIEW, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

  const loadSamplePreview = async (signal, requestId) => {
    const fallbackRes = await fetchPreviewPdf(
      { profile: profileSlug, template: templateId, content: "", showPhone, showLinkedin },
      signal
    );
    if (!fallbackRes.ok) return false;
    await setPreviewFromResponse(fallbackRes, requestId);
    setPreviewMode("sample");
    return true;
  };

  useEffect(() => {
    if (!templateId || !profileSlug) {
      setIframeSrc("");
      setPreviewError(null);
      return;
    }

    const validation = validateTailoredJsonInput(pastedContent, profileJobCount);
    if (pastedContent.trim() && !validation.ok) {
      setPreviewError(
        [validation.message, ...(validation.issues || [])].filter(Boolean).join("; ")
      );
    } else {
      setPreviewError(null);
    }

    const controller = new AbortController();
    const debounceMs = validation.ok && !validation.empty ? DEBOUNCE_LIVE_MS : DEBOUNCE_MS;
    const timer = setTimeout(async () => {
      const requestId = ++previewRequestIdRef.current;
      setLoading(true);

      if (pastedContent.trim() && !validation.ok) {
        try {
          await loadSamplePreview(controller.signal, requestId);
        } catch (e) {
          if (e.name !== "AbortError" && requestId === previewRequestIdRef.current) {
            setIframeSrc(withPdfViewParams(`/api/preview?template=${encodeURIComponent(templateId)}`));
            setPreviewMode("sample");
          }
        } finally {
          if (requestId === previewRequestIdRef.current) setLoading(false);
        }
        return;
      }

      const previewBody = {
        profile: profileSlug,
        template: templateId,
        content: pastedContent || "",
        showPhone,
        showLinkedin,
      };

      try {
        const res = await fetchPreviewPdf(previewBody, controller.signal);
        if (!res.ok) {
          const msg = await parseApiError(res);
          if (requestId === previewRequestIdRef.current) setPreviewError(msg);
          throw new Error(msg);
        }
        if (requestId === previewRequestIdRef.current) setPreviewError(null);
        await setPreviewFromResponse(res, requestId);
      } catch (e) {
        if (e.name === "AbortError" || requestId !== previewRequestIdRef.current) return;

        try {
          await loadSamplePreview(controller.signal, requestId);
        } catch (fallbackErr) {
          if (fallbackErr.name === "AbortError" || requestId !== previewRequestIdRef.current) return;
          if (requestId !== previewRequestIdRef.current) return;
          setIframeSrc(withPdfViewParams(`/api/preview?template=${encodeURIComponent(templateId)}`));
          setPreviewMode("sample");
        }
      } finally {
        if (requestId === previewRequestIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [templateId, profileSlug, profileJobCount, pastedContent, showPhone, showLinkedin]);

  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      setScale(w / DOC_W);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [iframeSrc]);

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
        className="template-pdf-preview-frame"
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${colors.inputBorder}`,
          background: theme === "dark" ? "#0f172a" : "#f8fafc",
          position: "relative",
        }}
      >
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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: DOC_W,
              height: DOC_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              title={`Template preview ${templateId}`}
              src={iframeSrc}
              scrolling="no"
              className="template-pdf-preview-iframe"
              style={{
                width: DOC_W,
                height: DOC_H,
                border: "none",
                display: "block",
                overflow: "hidden",
              }}
            />
          </div>
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
              background: previewError
                ? colors.errorBg
                : previewMode === "live"
                  ? colors.successBg
                  : colors.infoBg,
              color: previewError
                ? colors.errorText
                : previewMode === "live"
                  ? colors.successText
                  : colors.infoText,
              border: `1px solid ${
                previewError
                  ? colors.errorText
                  : previewMode === "live"
                    ? colors.successText
                    : colors.infoText
              }`,
              pointerEvents: "none",
            }}
          >
            {previewError ? "Invalid JSON" : previewMode === "live" ? "Your resume" : "Sample data"}
          </div>
        )}

        {previewError && !loading && (
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 8,
              zIndex: 3,
              padding: "8px 10px",
              borderRadius: 6,
              fontSize: 11,
              lineHeight: 1.45,
              color: colors.errorText,
              background: colors.errorBg,
              border: `1px solid ${colors.errorText}`,
            }}
          >
            {previewError}
          </div>
        )}
      </div>
    </div>
  );
}
