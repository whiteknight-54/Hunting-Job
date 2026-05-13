import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseResumeContentFromText,
  ResumeParseError,
  ResumeValidationError,
} from "./tailored-resume/index.js";

const valid = {
  title: "Eng",
  summary: "Sum",
  skills: { Core: ["Node"] },
  experience: [{ title: "Dev", details: ["Built things."] }],
};

describe("parseResumeContentFromText", () => {
  it("parses fenced JSON", () => {
    const raw = "```json\n" + JSON.stringify(valid) + "\n```";
    assert.deepEqual(parseResumeContentFromText(raw), valid);
  });

  it("throws ResumeParseError on garbage", () => {
    assert.throws(() => parseResumeContentFromText("not json"), ResumeParseError);
  });

  it("throws ResumeValidationError when fields missing", () => {
    assert.throws(() => parseResumeContentFromText('{"title":"x"}'), ResumeValidationError);
  });
});
