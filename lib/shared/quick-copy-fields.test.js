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

  it("returns empty array when profile is null", () => {
    assert.deepEqual(buildQuickCopyFields(null), []);
  });
});
