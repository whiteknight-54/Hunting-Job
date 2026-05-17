import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildQuickCopyFields } from "./quick-copy-fields.js";

describe("buildQuickCopyFields", () => {
  it("includes contact fields from profile", () => {
    const fields = buildQuickCopyFields({
      email: "a@b.com",
      phone: "123",
      experience: [{ company: "Acme", title: "Eng" }],
    });
    assert.ok(fields.some((f) => f.key === "email" && f.value === "a@b.com"));
    assert.ok(fields.some((f) => f.key === "lastCompany" && f.value === "Acme"));
  });

  it("labels location vs address separately", () => {
    const fields = buildQuickCopyFields({
      email: "a@b.com",
      location: "Berlin, DE",
      address: "1 Main St",
      experience: [],
    });
    const loc = fields.find((f) => f.key === "location");
    const addr = fields.find((f) => f.key === "address");
    assert.equal(loc?.label, "Location");
    assert.equal(loc?.value, "Berlin, DE");
    assert.equal(addr?.label, "Address");
    assert.equal(addr?.value, "1 Main St");
  });

  it("returns empty array when profile is null", () => {
    assert.deepEqual(buildQuickCopyFields(null), []);
  });

  it("uses local public/icons paths for tile images", () => {
    const fields = buildQuickCopyFields({ email: "a@b.com", experience: [] });
    const email = fields.find((f) => f.key === "email");
    assert.match(email?.iconUrl, /^\/icons\/email\.webp\?v=\d+$/);
  });

  it("uses github.svg from public/icons", () => {
    const fields = buildQuickCopyFields({
      email: "a@b.com",
      github: "https://github.com/example",
      experience: [],
    });
    const gh = fields.find((f) => f.key === "github");
    assert.match(gh?.iconUrl, /^\/icons\/github\.svg\?v=\d+$/);
    assert.equal(gh?.iconRender, "mask");
  });

  it("includes website and portfolio with icons when set", () => {
    const fields = buildQuickCopyFields({
      email: "a@b.com",
      website: "https://example.com",
      portfolio: "https://portfolio.example.com",
      experience: [],
    });
    const site = fields.find((f) => f.key === "website");
    const port = fields.find((f) => f.key === "portfolio");
    assert.equal(site?.value, "https://example.com");
    assert.match(site?.iconUrl, /\/icons\/website\.svg/);
    assert.equal(site?.openInNewTab, true);
    assert.match(port?.iconUrl, /\/icons\/portfolio\.svg/);
  });

  it("marks Google Drive folder link to open in a new tab", () => {
    const fields = buildQuickCopyFields({ email: "a@b.com", experience: [] }, "abc123xyz");
    const drive = fields.find((f) => f.key === "driveLink");
    assert.equal(drive?.openInNewTab, true);
    assert.equal(drive?.value, "https://drive.google.com/drive/folders/abc123xyz");
  });
});

