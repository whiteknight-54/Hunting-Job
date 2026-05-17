import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isGoogleDriveUploadConfigured } from "./google-drive.js";

const KEYS = [
  "GDRIVE_FOLDER_ID",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
];

describe("isGoogleDriveUploadConfigured", () => {
  /** @type {Record<string, string | undefined>} */
  let saved = {};

  beforeEach(() => {
    saved = {};
    for (const key of KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("is false when any OAuth env is missing", () => {
    assert.equal(isGoogleDriveUploadConfigured(), false);
    process.env.GDRIVE_FOLDER_ID = "folder";
    assert.equal(isGoogleDriveUploadConfigured(), false);
  });

  it("is true when folder id and OAuth credentials are set", () => {
    process.env.GDRIVE_FOLDER_ID = "folder-id";
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REFRESH_TOKEN = "refresh";
    assert.equal(isGoogleDriveUploadConfigured(), true);
  });
});
