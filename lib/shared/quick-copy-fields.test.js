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
});
