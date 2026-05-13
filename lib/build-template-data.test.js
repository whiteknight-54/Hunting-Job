import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildTemplateDataFromProfileAndResume } from "./build-template-data.js";

const profile = {
  name: "Jane Doe",
  title: "Engineer",
  email: "jane@example.com",
  phone: "+1 555 0100",
  location: "Austin, TX",
  linkedin: "https://linkedin.com/in/jane",
  website: "https://jane.dev",
  experience: [{ title: "Dev", company: "Co", details: ["old bullet"] }],
  education: [{ degree: "BS", school: "UT" }],
};

const resume = {
  title: "Senior Engineer",
  summary: "Tailored summary",
  skills: { Backend: ["Node"] },
  experience: [{ title: "Sr Dev", details: ["new bullet"] }],
};

describe("buildTemplateDataFromProfileAndResume", () => {
  it("preserves profile contact fields in template data", () => {
    const data = buildTemplateDataFromProfileAndResume(profile, resume);
    assert.equal(data.phone, "+1 555 0100");
    assert.equal(data.linkedin, "https://linkedin.com/in/jane");
    assert.equal(data.website, "https://jane.dev");
    assert.equal(data.email, "jane@example.com");
  });

  it("overlays tailored title, summary, skills, and bullets", () => {
    const data = buildTemplateDataFromProfileAndResume(profile, resume);
    assert.equal(data.title, "Senior Engineer");
    assert.equal(data.summary, "Tailored summary");
    assert.deepEqual(data.skills, { Backend: ["Node"] });
    assert.equal(data.experience[0].title, "Sr Dev");
    assert.deepEqual(data.experience[0].details, ["new bullet"]);
    assert.equal(data.experience[0].company, "Co");
  });
});
