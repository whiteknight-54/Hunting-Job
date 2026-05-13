import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeProfileWithResumeOutput } from "./merge-profile-resume.js";

const profile = {
  name: "Jane Doe",
  title: "Software Engineer",
  email: "jane@example.com",
  experience: [
    { company: "Acme", title: "Engineer", start_date: "2020", end_date: "Present", details: ["Old bullet"] },
  ],
  education: [{ degree: "BS CS", school: "State U" }],
};

const resume = {
  title: "Senior Backend Engineer",
  summary: "Tailored summary for this role.",
  skills: { Backend: ["Node.js"] },
  experience: [{ title: "Senior Engineer", details: ["New tailored bullet"] }],
};

describe("mergeProfileWithResumeOutput", () => {
  it("keeps profile contact and overlays resume fields", () => {
    const merged = mergeProfileWithResumeOutput(profile, resume);
    assert.equal(merged.name, "Jane Doe");
    assert.equal(merged.email, "jane@example.com");
    assert.equal(merged.title, "Senior Backend Engineer");
    assert.equal(merged.summary, "Tailored summary for this role.");
    assert.deepEqual(merged.skills, { Backend: ["Node.js"] });
    assert.equal(merged.experience[0].company, "Acme");
    assert.equal(merged.experience[0].title, "Senior Engineer");
    assert.deepEqual(merged.experience[0].details, ["New tailored bullet"]);
    assert.deepEqual(merged.education, profile.education);
  });

  it("returns profile copy when resume is null", () => {
    const merged = mergeProfileWithResumeOutput(profile, null);
    assert.equal(merged.title, "Software Engineer");
    assert.equal(merged.experience[0].details[0], "Old bullet");
  });
});
