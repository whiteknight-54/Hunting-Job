import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDownloadPdfFilename } from "./pdf-filename.js";

describe("buildDownloadPdfFilename", () => {
  it("uses ProfileBasename_Role_Company order", () => {
    assert.equal(
      buildDownloadPdfFilename("Full Stack Engineer", "Acme", "temp"),
      "temp_Full_Stack_Engineer_Acme.pdf"
    );
  });
});
