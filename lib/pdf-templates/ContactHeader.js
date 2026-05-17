import React from "react";
import { Text, View, Link } from "@react-pdf/renderer";
import { buildContactParts } from "./contact-lines";

const defaultLinkColor = "#2563eb";

function ContactSeparator({ style }) {
  return <Text style={style}> • </Text>;
}

/** Center-aligned contact row with optional embedded LinkedIn link. */
export function CenterContactRow({ data, textStyle, linkColor = defaultLinkColor }) {
  const parts = buildContactParts(data);
  if (!parts.length) return null;

  const linkStyle = { color: linkColor, textDecoration: "underline" };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        ...textStyle,
      }}
    >
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <ContactSeparator style={textStyle} /> : null}
          {part.kind === "link" ? (
            <Link src={part.href} style={linkStyle}>
              <Text style={[textStyle, linkStyle]}>{part.label}</Text>
            </Link>
          ) : (
            <Text style={textStyle}>{part.value}</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

/** Right-aligned stacked contact lines (split header). */
export function SplitContactList({ data, textStyle, itemStyle, linkColor = defaultLinkColor }) {
  const parts = buildContactParts(data);
  if (!parts.length) return null;

  const linkStyle = { color: linkColor, textDecoration: "underline" };

  return (
    <View>
      {parts.map((part, i) =>
        part.kind === "link" ? (
          <Link key={i} src={part.href} style={[textStyle, itemStyle, linkStyle]}>
            <Text style={[textStyle, itemStyle, linkStyle]}>{part.label}</Text>
          </Link>
        ) : (
          <Text key={i} style={[textStyle, itemStyle]}>
            {part.value}
          </Text>
        )
      )}
    </View>
  );
}
