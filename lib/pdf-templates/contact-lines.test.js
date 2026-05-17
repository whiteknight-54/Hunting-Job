import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildContactParts, normalizeLinkedInUrl } from "./contact-lines.js";
import { mergeForPdf } from "../core/resume.js";
import { parsePdfContactFlags, PDF_CONTACT_DEFAULTS } from "../shared/pdf-contact-prefs.js";

describe("parsePdfContactFlags", () => {
  it("matches product defaults when body omits flags", () => {
    assert.deepEqual(parsePdfContactFlags({}), PDF_CONTACT_DEFAULTS);
  });
});

describe("normalizeLinkedInUrl", () => {
  it("adds https when missing", () => {
    assert.equal(normalizeLinkedInUrl("linkedin.com/in/foo"), "https://linkedin.com/in/foo");
  });

  it("keeps full https URL", () => {
    assert.equal(normalizeLinkedInUrl("https://www.linkedin.com/in/foo"), "https://www.linkedin.com/in/foo");
  });
});

describe("buildContactParts", () => {
  it("uses linkedin label with href, not raw URL text", () => {
    const parts = buildContactParts({
      email: "a@b.com",
      linkedin: "linkedin.com/in/jane",
    });
    assert.equal(parts.length, 2);
    assert.equal(parts[1].kind, "link");
    assert.equal(parts[1].label, "linkedin");
    assert.equal(parts[1].href, "https://linkedin.com/in/jane");
  });
});

describe("mergeForPdf contact flags", () => {
  const profile = { email: "a@b.com", phone: "555", linkedin: "https://linkedin.com/in/x" };
  const tailored = { title: "T", summary: "S", skills: { X: ["y"] }, experience: [{ details: ["d"] }] };

  it("omits phone when showPhone is false", () => {
    const data = mergeForPdf(profile, tailored, { showPhone: false, showLinkedin: true });
    assert.equal(data.phone, null);
    assert.ok(data.linkedin);
  });

  it("omits linkedin when showLinkedin is false", () => {
    const data = mergeForPdf(profile, tailored, { showPhone: true, showLinkedin: false });
    assert.ok(data.phone);
    assert.equal(data.linkedin, null);
  });
});
