import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPdfFileName } from "./pdf-filename.js";

describe("buildPdfFileName", () => {
  it("builds First_Last_role_company.pdf", () => {
    assert.equal(
      buildPdfFileName("Joao_Franco", "Senior Engineer", "Acme Corp"),
      "Joao_Franco_Senior_Engineer_Acme_Corp.pdf"
    );
  });

  it("omits company when empty", () => {
    assert.equal(buildPdfFileName("Lucas_Moura", "Staff Engineer", null), "Lucas_Moura_Staff_Engineer.pdf");
  });

  it("sanitizes special characters", () => {
    assert.equal(buildPdfFileName("A_B", "Lead (Remote)", "Foo & Bar!"), "A_B_Lead_Remote_Foo__Bar.pdf");
  });
});
