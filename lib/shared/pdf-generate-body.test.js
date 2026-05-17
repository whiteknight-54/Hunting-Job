import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsePdfGenerateBody, parsePdfPreviewBody } from "./pdf-generate-body.js";

describe("parsePdfGenerateBody", () => {
  it("parses profile and contact flags with defaults", () => {
    const body = parsePdfGenerateBody({ profile: "jf", roleName: "Dev", companyName: "Acme" });
    assert.equal(body.profileSlug, "jf");
    assert.equal(body.showPhone, false);
    assert.equal(body.showLinkedin, true);
  });

  it("shows phone only when explicitly true", () => {
    assert.equal(parsePdfGenerateBody({ showPhone: true }).showPhone, true);
  });
});

describe("parsePdfPreviewBody", () => {
  it("includes content and omits role fields", () => {
    const body = parsePdfPreviewBody({ profile: "a", content: "{}", showLinkedin: false });
    assert.equal(body.profileSlug, "a");
    assert.equal(body.showLinkedin, false);
    assert.equal("roleName" in body, false);
  });
});
