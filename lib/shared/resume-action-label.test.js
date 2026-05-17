import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPdfSuccessMessage,
  getPdfBusyStatusLabel,
  getResumeActionLabel,
} from "./resume-action-label.js";

describe("getResumeActionLabel", () => {
  it("manual uses Generate PDF", () => {
    assert.equal(getResumeActionLabel({ busy: false, variant: "manual" }), "Generate PDF");
    assert.equal(getResumeActionLabel({ busy: true, variant: "manual" }), "Generate PDF…");
  });

  it("auto uses Generate PDF with model", () => {
    assert.equal(
      getResumeActionLabel({ busy: false, variant: "auto", aiModel: "gpt-4o-mini" }),
      "Generate PDF with gpt-4o-mini"
    );
    assert.equal(
      getResumeActionLabel({ busy: true, variant: "auto", aiModel: "gpt-4o-mini" }),
      "Generate PDF with gpt-4o-mini…"
    );
  });
});

describe("getPdfBusyStatusLabel", () => {
  it("shows generating resume with model for auto", () => {
    assert.equal(
      getPdfBusyStatusLabel({ phase: "generating_resume", phaseElapsed: 2, aiModel: "gpt-4o-mini" }),
      "Generating resume with gpt-4o-mini 2s"
    );
  });

  it("shows uploading and downloading PDF phases", () => {
    assert.equal(getPdfBusyStatusLabel({ phase: "uploading", phaseElapsed: 1 }), "Uploading PDF 1s");
    assert.equal(getPdfBusyStatusLabel({ phase: "downloading", phaseElapsed: 2 }), "Downloading PDF 2s");
  });
});

describe("formatPdfSuccessMessage", () => {
  it("reports download only when Drive is off", () => {
    assert.equal(
      formatPdfSuccessMessage({
        fileName: "Joao_Franco_role.pdf",
        downloadSeconds: 1,
        driveUploadEnabled: false,
        driveUpload: { status: "skipped" },
      }),
      "Joao_Franco_role.pdf — Download: OK · 1s"
    );
  });

  it("reports download and upload with separate times when Drive is on", () => {
    assert.equal(
      formatPdfSuccessMessage({
        fileName: "Joao_Franco_123_123.pdf",
        downloadSeconds: 1,
        uploadSeconds: 1,
        driveUploadEnabled: true,
        driveUpload: { status: "ok" },
      }),
      "Joao_Franco_123_123.pdf — Download: OK · 1s · Upload: OK · 1s"
    );
  });
});
