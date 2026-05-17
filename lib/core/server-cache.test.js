import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { memoAsync, clearAllMemo } from "./server-cache.js";

describe("memoAsync", () => {
  beforeEach(() => clearAllMemo());

  it("calls loader once within TTL", async () => {
    let n = 0;
    const load = () => {
      n += 1;
      return Promise.resolve("ok");
    };
    assert.equal(await memoAsync("k", 60_000, load), "ok");
    assert.equal(await memoAsync("k", 60_000, load), "ok");
    assert.equal(n, 1);
  });

  it("dedupes concurrent loads", async () => {
    let n = 0;
    const load = () =>
      new Promise((resolve) => {
        n += 1;
        setTimeout(() => resolve("x"), 20);
      });
    const [a, b] = await Promise.all([memoAsync("k2", 60_000, load), memoAsync("k2", 60_000, load)]);
    assert.equal(a, "x");
    assert.equal(b, "x");
    assert.equal(n, 1);
  });
});
