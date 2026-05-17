import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allQuickCopyIconUrls } from "./preload-quick-copy-icons.js";
import { QUICK_COPY_ICONS } from "./quick-copy-icons.js";

describe("preload-quick-copy-icons", () => {
  it("lists unique /icons/* asset paths", () => {
    const urls = allQuickCopyIconUrls();
    const withSrc = Object.values(QUICK_COPY_ICONS).filter((e) => e.src);
    assert.equal(urls.length, withSrc.length);
    assert.ok(withSrc.some((e) => e.src.endsWith("website.svg")));
    assert.ok(withSrc.some((e) => e.src.endsWith("portfolio.svg")));
    assert.ok(urls.every((u) => u.startsWith("/icons/")));
    assert.ok(urls.every((u) => /\.(webp|svg)$/i.test(u)));
  });
});
