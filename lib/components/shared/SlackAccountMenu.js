import { useRef, useState } from "react";
import PopoverPanel from "../PopoverPanel";
import SlackLogoMark from "./SlackLogoMark";
import { initialsFromName } from "../../shared/useSlackSession";

export default function SlackAccountMenu({
  colors,
  theme,
  slackUser,
  onSignOut,
  iconBtn,
  placement = "top",
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  if (!slackUser) return null;

  const name = slackUser.name || "Slack user";
  const email = slackUser.email || "";
  const picture = slackUser.picture || null;
  const initials = initialsFromName(name);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Slack account menu"
        aria-expanded={open}
        aria-haspopup="true"
        title={email || name}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 6px 4px 4px",
          background: "transparent",
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 999,
          cursor: "pointer",
          color: colors.text,
        }}
      >
        <span style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
          {picture ? (
            <img
              src={picture}
              alt=""
              width={36}
              height={36}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${colors.cardBorder}`,
                display: "block",
              }}
            />
          ) : (
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: colors.buttonText,
                background: colors.buttonBg,
                border: `2px solid ${colors.cardBorder}`,
              }}
            >
              {initials}
            </span>
          )}
          <span
            style={{
              position: "absolute",
              right: -2,
              bottom: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff",
              border: `1px solid ${colors.cardBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          >
            <SlackLogoMark size={11} />
          </span>
        </span>
        <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1 }} aria-hidden="true">
          ▾
        </span>
      </button>

      <PopoverPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        maxWidth={260}
        placement={placement}
        topInsetVh={10}
        alignTopRightToAnchor
        colors={colors}
        theme={theme}
        ariaLabel="Slack account"
      >
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>{name}</div>
          {email && (
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, wordBreak: "break-all" }}>{email}</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: colors.textSecondary, marginBottom: 12 }}>
            <SlackLogoMark size={14} />
            <span>Signed in with Slack · BOC-E</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut?.();
            }}
            style={{
              ...iconBtn(false),
              width: "100%",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Sign out
          </button>
        </div>
      </PopoverPanel>
    </>
  );
}
