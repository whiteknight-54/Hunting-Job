import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isValidResumeOutput,
  tryParseResumeOutput,
} from "./tailored-resume/index.js";

const validResume = {
  title: "Engineer",
  summary: "Summary",
  skills: { Backend: ["Node"] },
  experience: [{ title: "Dev", details: ["Built APIs"] }],
};

describe("isValidResumeOutput", () => {
  it("accepts objects with required fields", () => {
    assert.equal(isValidResumeOutput(validResume), true);
  });

  it("rejects incomplete objects", () => {
    assert.equal(isValidResumeOutput({ title: "x" }), false);
    assert.equal(isValidResumeOutput(null), false);
  });
});

describe("tryParseResumeOutput", () => {
  it("returns null for empty or invalid content", () => {
    assert.equal(tryParseResumeOutput(""), null);
    assert.equal(tryParseResumeOutput("not json"), null);
    assert.equal(tryParseResumeOutput(JSON.stringify({ title: "only" })), null);
  });

  it("returns parsed resume for valid fenced JSON", () => {
    const raw = "```json\n" + JSON.stringify(validResume) + "\n```";
    assert.deepEqual(tryParseResumeOutput(raw), validResume);
  });
});
