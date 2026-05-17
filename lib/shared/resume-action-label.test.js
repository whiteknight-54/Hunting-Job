import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPdfSuccessMessage, getResumeActionLabel } from "./resume-action-label.js";

describe("getResumeActionLabel", () => {
  it("uses Download Resume when Drive upload is off", () => {
    assert.equal(getResumeActionLabel({ busy: false, driveUploadEnabled: false }), "Download Resume");
  });

  it("uses Upload Resume when Drive upload is on", () => {
    assert.equal(getResumeActionLabel({ busy: false, driveUploadEnabled: true }), "Upload Resume");
  });
});

describe("formatPdfSuccessMessage", () => {
  it("reports local-only PDF when Drive is off", () => {
    assert.equal(
      formatPdfSuccessMessage({
        seconds: 1.5,
        driveUploadEnabled: false,
        driveUpload: { status: "skipped" },
      }),
      "PDF generated in 1.5s"
    );
  });

  it("reports upload success", () => {
    assert.equal(
      formatPdfSuccessMessage({
        seconds: 2.1,
        driveUploadEnabled: true,
        driveUpload: { status: "ok" },
      }),
      "Resume uploaded in 2.1s"
    );
  });
});
