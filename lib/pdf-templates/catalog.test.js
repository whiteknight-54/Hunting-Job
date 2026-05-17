import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listTemplateCatalog, isKnownTemplateId, TEMPLATE_CATALOG } from "./catalog.js";
import { normalizeTemplateId } from "./load-template.js";

describe("pdf-templates catalog", () => {
  it("listTemplateCatalog includes Resume first", () => {
    const list = listTemplateCatalog();
    assert.ok(list.length >= TEMPLATE_CATALOG.length);
    assert.equal(list[0].id, "Resume");
  });

  it("isKnownTemplateId validates ids", () => {
    assert.equal(isKnownTemplateId("Resume-Tech-Teal"), true);
    assert.equal(isKnownTemplateId("not-a-template"), false);
  });

  it("normalizeTemplateId falls back to Resume", () => {
    assert.equal(normalizeTemplateId("Resume-Bold-Emerald"), "Resume-Bold-Emerald");
    assert.equal(normalizeTemplateId("unknown"), "Resume");
  });
});
