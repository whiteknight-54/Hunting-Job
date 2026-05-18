import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildTailorAppSheetRow,
  driveLinkFromUpload,
  formatTailorAppSheetDate,
} from "../core/google-sheets.js";

describe("formatTailorAppSheetDate", () => {
  it("formats mm/dd in Asia/Tokyo (UTC+9)", () => {
    const d = new Date("2026-01-15T14:00:00.000Z");
    assert.equal(formatTailorAppSheetDate(d), "01/15");
    const nextDay = new Date("2026-01-15T18:00:00.000Z");
    assert.equal(formatTailorAppSheetDate(nextDay), "01/16");
  });
});

describe("buildTailorAppSheetRow", () => {
  it("returns Date, Bidder, FileName, link", () => {
    const row = buildTailorAppSheetRow({
      date: "05/17",
      userName: "Tonny",
      fileName: "Joao_role_co.pdf",
      driveLink: "https://drive.google.com/file/d/abc",
    });
    assert.deepEqual(row, ["05/17", "Tonny", "Joao_role_co.pdf", "https://drive.google.com/file/d/abc"]);
  });

  it("defaults bidder to User when name missing", () => {
    const row = buildTailorAppSheetRow({ date: "01/02", fileName: "a.pdf", driveLink: "" });
    assert.equal(row[1], "User");
  });
});

describe("driveLinkFromUpload", () => {
  it("returns webViewLink when upload ok", () => {
    assert.equal(
      driveLinkFromUpload({ ok: true, webViewLink: "https://drive.google.com/file/d/x" }),
      "https://drive.google.com/file/d/x"
    );
  });

  it("returns empty when skipped or failed", () => {
    assert.equal(driveLinkFromUpload({ ok: false, skipped: true }), "");
    assert.equal(driveLinkFromUpload({ ok: false, error: "nope" }), "");
  });
});
