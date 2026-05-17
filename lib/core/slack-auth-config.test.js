import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  isSlackAuthConfigured,
  isSlackAuthEnforced,
  isSlackAuthEnabled,
} from "./slack-auth-config.js";

const KEYS = ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET", "SLACK_TEAM_ID", "SLACK_AUTH_REQUIRED"];

describe("slack-auth-config", () => {
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

  it("isSlackAuthConfigured is false when OAuth env is incomplete", () => {
    assert.equal(isSlackAuthConfigured(), false);
    process.env.SLACK_CLIENT_ID = "id";
    assert.equal(isSlackAuthConfigured(), false);
  });

  it("isSlackAuthConfigured is true when all OAuth env vars are set", () => {
    process.env.SLACK_CLIENT_ID = "id";
    process.env.SLACK_CLIENT_SECRET = "secret";
    process.env.SLACK_TEAM_ID = "T123";
    assert.equal(isSlackAuthConfigured(), true);
    assert.equal(isSlackAuthEnabled(), true);
  });

  it("isSlackAuthEnforced follows SLACK_CLIENT_ID by default", () => {
    assert.equal(isSlackAuthEnforced(), false);
    process.env.SLACK_CLIENT_ID = "id";
    assert.equal(isSlackAuthEnforced(), true);
  });
});
