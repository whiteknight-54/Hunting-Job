import { HELP_GUIDE_SECTIONS } from "../../help-guide";

export default function HelpGuideContent({ colors }) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.55, color: colors.textSecondary }}>
      {HELP_GUIDE_SECTIONS.map((sec) => (
        <div key={sec.id} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${colors.cardBorder}`,
            }}
          >
            {sec.title}
          </div>
          {sec.intro && (
            <p style={{ margin: "0 0 10px 0" }}>
              {sec.intro}
            </p>
          )}
          {sec.steps?.length > 0 && (
            <ol
              style={{
                margin: "0 0 10px 0",
                paddingLeft: 20,
                listStylePosition: "outside",
              }}
            >
              {sec.steps.map((s, i) => (
                <li key={i} style={{ marginBottom: 10, paddingLeft: 4 }}>
                  <span style={{ fontWeight: 600, color: colors.text }}>{s.title}</span>
                  {s.body ? (
                    <div style={{ marginTop: 4, fontWeight: 400, color: colors.textSecondary }}>{s.body}</div>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
          {(sec.paragraphs || []).map((p) => (
            <p key={p.slice(0, 24)} style={{ margin: "0 0 8px 0" }}>
              {p}
            </p>
          ))}
          {sec.bullets?.length > 0 && (
            <ul style={{ margin: "0 0 8px 0", paddingLeft: 18 }}>
              {sec.bullets.map((b) => (
                <li key={b.slice(0, 32)} style={{ marginBottom: 4 }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {sec.note && (
            <p style={{ margin: 0, fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>
              {sec.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
