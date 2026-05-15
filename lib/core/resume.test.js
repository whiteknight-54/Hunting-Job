import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatTailoredJsonIssues,
  parseTailoredJson,
  validateTailoredJsonInput,
} from "./resume.js";

const valid = {
  title: "Engineer",
  summary: "Summary text",
  skills: { Backend: ["Node.js"] },
  experience: [{ details: ["Did work"] }, { details: ["More work"] }],
};

describe("validateTailoredJsonInput", () => {
  it("accepts empty input", () => {
    const result = validateTailoredJsonInput("", 2);
    assert.equal(result.ok, true);
    assert.equal(result.empty, true);
    assert.equal(formatTailoredJsonIssues(result), null);
  });

  it("rejects invalid JSON syntax", () => {
    const result = validateTailoredJsonInput("{not json", 2);
    assert.equal(result.ok, false);
    assert.match(formatTailoredJsonIssues(result), /valid JSON/i);
  });

  it("rejects schema issues", () => {
    const result = validateTailoredJsonInput(JSON.stringify({ title: "Only title" }), 2);
    assert.equal(result.ok, false);
    assert.ok((result.issues || []).length > 0);
  });

  it("accepts fenced valid JSON", () => {
    const raw = "```json\n" + JSON.stringify(valid, null, 2) + "\n```";
    const result = validateTailoredJsonInput(raw, 2);
    assert.equal(result.ok, true);
    assert.equal(result.empty, false);
    assert.equal(parseTailoredJson(raw).title, "Engineer");
  });
});
