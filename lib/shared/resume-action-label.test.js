import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPdfSuccessMessage,
  getPdfBusyStatusLabel,
  getResumeActionLabel,
} from "./resume-action-label.js";

describe("getResumeActionLabel", () => {
  it("uses Download Resume when Drive upload is off", () => {
    assert.equal(getResumeActionLabel({ busy: false, driveUploadEnabled: false }), "Download Resume");
  });

  it("uses Download & upload when Drive upload is on", () => {
    assert.equal(getResumeActionLabel({ busy: false, driveUploadEnabled: true }), "Download & upload");
  });

  it("shows busy label for Drive flow", () => {
    assert.equal(getResumeActionLabel({ busy: true, driveUploadEnabled: true }), "Download & upload…");
  });
});

describe("getPdfBusyStatusLabel", () => {
  it("mentions download and upload when Drive is on", () => {
    assert.match(getPdfBusyStatusLabel({ driveUploadEnabled: true }), /Downloading.*uploading/i);
  });
});

describe("formatPdfSuccessMessage", () => {
  it("reports download only when Drive is off", () => {
    assert.equal(
      formatPdfSuccessMessage({
        seconds: 1.5,
        driveUploadEnabled: false,
        driveUpload: { status: "skipped" },
        fileName: "Joao_Franco_role.pdf",
      }),
      "Download: OK (Joao_Franco_role.pdf) · 1.5s"
    );
  });

  it("reports download and upload success when Drive is on", () => {
    assert.equal(
      formatPdfSuccessMessage({
        seconds: 2.1,
        driveUploadEnabled: true,
        driveUpload: { status: "ok" },
        fileName: "resume.pdf",
      }),
      "Download: OK (resume.pdf) · 2.1s · Upload: OK"
    );
  });

  it("reports upload failure when Drive is on", () => {
    assert.equal(
      formatPdfSuccessMessage({
        seconds: 2,
        driveUploadEnabled: true,
        driveUpload: { status: "failed", error: "quota" },
      }),
      "Download: OK · 2s · Upload: failed — quota"
    );
  });
});
