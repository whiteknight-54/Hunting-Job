import SlackLogoMark from "./SlackLogoMark";

export default function SlackLoginButton({ onClick, fullWidth = false, label = "Sign in with Slack" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: fullWidth ? "100%" : "auto",
        padding: "12px 20px",
        fontSize: 15,
        fontWeight: 600,
        color: "#fff",
        background: "#4A154B",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
        transition: "background 0.15s ease, transform 0.1s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#611f69";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#4A154B";
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: 6,
          background: "#fff",
        }}
      >
        <SlackLogoMark size={16} />
      </span>
      {label}
    </button>
  );
}
