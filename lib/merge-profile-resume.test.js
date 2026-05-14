import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeProfileWithTailoredResume } from "./tailored-resume/index.js";

const profile = {
  name: "Jane Doe",
  email: "jane@example.com",
  experience: [
    { company: "Acme", title: "Engineer", location: "TX", start_date: "2020", end_date: "Present" },
  ],
  education: [{ degree: "BS CS", school: "State U" }],
  screening: { notes: "Prefers backend roles." },
};

const resume = {
  title: "Senior Backend Engineer",
  summary: "Tailored summary for this role.",
  skills: { Backend: ["Node.js"] },
  experience: [{ details: ["New tailored bullet"] }],
};

describe("mergeProfileWithTailoredResume", () => {
  it("keeps profile contact and overlays tailored fields", () => {
    const merged = mergeProfileWithTailoredResume(profile, resume);
    assert.equal(merged.name, "Jane Doe");
    assert.equal(merged.email, "jane@example.com");
    assert.equal(merged.title, "Senior Backend Engineer");
    assert.equal(merged.summary, "Tailored summary for this role.");
    assert.deepEqual(merged.skills, { Backend: ["Node.js"] });
    assert.equal(merged.experience[0].company, "Acme");
    assert.equal(merged.experience[0].title, "Engineer");
    assert.deepEqual(merged.experience[0].details, ["New tailored bullet"]);
    assert.deepEqual(merged.education, profile.education);
    assert.deepEqual(merged.screening, profile.screening);
  });

  it("returns profile copy when resume is null", () => {
    const merged = mergeProfileWithTailoredResume(profile, null);
    assert.equal(merged.name, "Jane Doe");
    assert.equal(merged.title, undefined);
    assert.equal(merged.experience[0].details, undefined);
  });
});
