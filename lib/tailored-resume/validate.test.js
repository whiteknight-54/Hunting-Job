import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeTailoredResumeOutput } from "./normalize.js";
import { validateTailoredResumeOutput } from "./validate.js";
import { parseTailoredResumeFromText, TailoredResumeValidationError } from "./parse.js";

const valid = {
  title: "Senior Engineer | React",
  summary: "Experienced engineer with a strong track record.",
  skills: { Frontend: ["React", "TypeScript"] },
  experience: [{ title: "Sr Eng", details: ["Built platform.", "Led team."] }],
};

describe("normalizeTailoredResumeOutput", () => {
  it("coerces bullet objects and string details", () => {
    const normalized = normalizeTailoredResumeOutput({
      title: "  Eng  ",
      summary: "Sum",
      skills: ["React", "Node"],
      experience: [{ details: { text: "Did work" } }],
    });
    assert.equal(normalized.title, "Eng");
    assert.deepEqual(normalized.skills.General, ["React", "Node"]);
    assert.deepEqual(normalized.experience[0].details, ["Did work"]);
  });
});

describe("validateTailoredResumeOutput", () => {
  it("accepts valid structure", () => {
    assert.equal(validateTailoredResumeOutput(valid).valid, true);
  });

  it("rejects empty skills category", () => {
    const bad = { ...valid, skills: { Empty: [] } };
    const { valid: ok, issues } = validateTailoredResumeOutput(bad);
    assert.equal(ok, false);
    assert.ok(issues.some((i) => i.includes("skills.Empty")));
  });

  it("rejects profile-owned fields on experience", () => {
    const bad = {
      ...valid,
      experience: [{ company: "Acme", details: ["x"] }],
    };
    const { issues } = validateTailoredResumeOutput(bad);
    assert.ok(issues.some((i) => i.includes("company")));
  });

  it("enforces experience count when expected", () => {
    const { issues } = validateTailoredResumeOutput(valid, { expectedExperienceCount: 2 });
    assert.ok(issues.some((i) => i.includes("experience must have 2 entries")));
  });
});

describe("parseTailoredResumeFromText", () => {
  it("parses fenced JSON and validates deeply", () => {
    const parsed = parseTailoredResumeFromText("```json\n" + JSON.stringify(valid) + "\n```");
    assert.equal(parsed.title, valid.title);
  });

  it("throws TailoredResumeValidationError with issues list", () => {
    assert.throws(
      () => parseTailoredResumeFromText(JSON.stringify({ title: "only title" })),
      TailoredResumeValidationError
    );
  });
});
