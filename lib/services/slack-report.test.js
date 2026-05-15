import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatJdPreview } from "./slack-report.js";

describe("formatJdPreview", () => {
  it("returns (empty) for blank jd", () => {
    assert.equal(formatJdPreview(""), "(empty)");
    assert.equal(formatJdPreview("   "), "(empty)");
  });

  it("returns all lines when short", () => {
    assert.equal(formatJdPreview("a\nb\nc"), "a\nb\nc");
  });

  it("truncates middle with ellipsis between first 3 and last 3 lines", () => {
    const jd = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].join("\n");
    const out = formatJdPreview(jd, 3, 3);
    assert.ok(out.startsWith("1\n2\n3\n"));
    assert.ok(out.includes("\n…\n"));
    assert.ok(out.endsWith("8\n9\n10"));
  });

  it("tail is from the full JD, not from a character-clipped prefix", () => {
    const oneLine = `${"x".repeat(120)}\n`;
    const body = oneLine.repeat(45);
    const jd = `${body}END_LINE_A\nEND_LINE_B\nEND_LINE_C`;
    const out = formatJdPreview(jd, 3, 3);
    assert.ok(out.endsWith("END_LINE_A\nEND_LINE_B\nEND_LINE_C"), out);
  });
});
