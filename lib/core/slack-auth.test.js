import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAuthErrorRedirect,
  isSlackAuthConfigured,
  parseReturnToQuery,
  sanitizeReturnPath,
} from "./slack-auth.js";

describe("slack-auth re-exports", () => {
  it("exports isSlackAuthConfigured from config", () => {
    assert.equal(typeof isSlackAuthConfigured, "function");
  });
});

describe("sanitizeReturnPath", () => {
  it("defaults to home", () => {
    assert.equal(sanitizeReturnPath(""), "/");
    assert.equal(sanitizeReturnPath(undefined), "/");
  });

  it("allows internal paths", () => {
    assert.equal(sanitizeReturnPath("/manual/p1"), "/manual/p1");
    assert.equal(sanitizeReturnPath("/manual/jf"), "/manual/jf");
    assert.equal(sanitizeReturnPath("/auto/jf"), "/auto/jf");
    assert.equal(sanitizeReturnPath("/?x=1"), "/?x=1");
  });

  it("decodes encoded return paths", () => {
    assert.equal(sanitizeReturnPath("%2Fmanual%2Fjf"), "/manual/jf");
  });
});

describe("parseReturnToQuery", () => {
  it("reads profile deep link from query", () => {
    assert.equal(parseReturnToQuery("/manual/jf"), "/manual/jf");
    assert.equal(parseReturnToQuery(["/manual/jf"]), "/manual/jf");
  });
});

describe("buildAuthErrorRedirect", () => {
  it("appends auth_error to profile URL", () => {
    assert.equal(
      buildAuthErrorRedirect("/manual/jf", "wrong_team"),
      "/manual/jf?auth_error=wrong_team"
    );
  });
});

describe("sanitizeReturnPath — blocks", () => {

  it("blocks external URLs", () => {
    assert.equal(sanitizeReturnPath("https://evil.com"), "/");
    assert.equal(sanitizeReturnPath("//evil.com"), "/");
  });
});
