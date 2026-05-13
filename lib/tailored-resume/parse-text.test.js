import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractJsonFromText } from "./parse-text.js";

const sample = {
  title: "Engineer",
  summary: "Summary text",
  skills: { Backend: ["Node"] },
  experience: [{ title: "Dev", details: ["Built APIs"] }],
};

describe("extractJsonFromText", () => {
  it("parses fenced JSON", () => {
    const raw = "```json\n" + JSON.stringify(sample) + "\n```";
    assert.deepEqual(extractJsonFromText(raw), sample);
  });

  it("parses JSON with preamble", () => {
    const raw = "Here is the JSON:\n" + JSON.stringify(sample);
    assert.deepEqual(extractJsonFromText(raw), sample);
  });

  it("throws on empty input", () => {
    assert.throws(() => extractJsonFromText(""), /empty/i);
    assert.throws(() => extractJsonFromText(null), /required/i);
  });

  it("throws when no object braces found", () => {
    assert.throws(() => extractJsonFromText("not json at all"), /no json object/i);
  });

  it("extracts first balanced object from surrounding text", () => {
    const raw = `Some intro\n${JSON.stringify(sample)}\nTrailing note`;
    assert.deepEqual(extractJsonFromText(raw), sample);
  });
});
