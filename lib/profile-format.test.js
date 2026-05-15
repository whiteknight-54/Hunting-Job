import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatTailoredResumeContext } from "./profile-format.js";

const profile = {
  name: "Jane Doe",
  email: "jane@example.com",
  experience: [
    { company: "Acme", title: "Engineer", start_date: "2020", end_date: "2024" },
  ],
  screening: { workAuthorization: "US citizen", customAnswers: { q1: "yes" } },
};

const tailored = {
  title: "Senior Engineer",
  summary: "Backend specialist with 8 years of experience.",
  skills: { Languages: ["TypeScript", "Go"] },
  experience: [{ title: "Senior Engineer", details: ["Built APIs", "Led team"] }],
};

describe("formatTailoredResumeContext", () => {
  it("formats merged resume as readable text, not JSON", () => {
    const text = formatTailoredResumeContext(profile, tailored);
    assert.ok(!text.trimStart().startsWith("{"));
    assert.match(text, /Name: Jane Doe/);
    assert.match(text, /Title: Senior Engineer/);
    assert.match(text, /Summary:/);
    assert.match(text, /Backend specialist/);
    assert.match(text, /Languages: TypeScript, Go/);
    assert.match(text, /Senior Engineer @ Acme/);
    assert.match(text, /• Built APIs/);
    assert.match(text, /Screening:/);
    assert.match(text, /workAuthorization: US citizen/);
    assert.match(text, /q1: yes/);
  });

  it("falls back to profile-only when tailored JSON is missing", () => {
    const text = formatTailoredResumeContext(profile, null);
    assert.match(text, /Engineer @ Acme/);
    assert.doesNotMatch(text, /Summary:/);
  });
});
