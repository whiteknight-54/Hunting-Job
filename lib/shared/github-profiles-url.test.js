import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildGithubProfileFileUrl } from "./github-profiles-url.js";

describe("buildGithubProfileFileUrl", () => {
  const treeBase = "https://github.com/org/repo/tree/main/profiles";

  it("returns null when base is empty", () => {
    assert.equal(buildGithubProfileFileUrl("", "Joao_Franco"), null);
  });

  it("returns base when basename is missing", () => {
    assert.equal(buildGithubProfileFileUrl(treeBase, ""), treeBase);
  });

  it("converts tree URL to edit URL with profile file", () => {
    assert.equal(
      buildGithubProfileFileUrl(treeBase, "Joao_Franco"),
      "https://github.com/org/repo/edit/main/profiles/Joao_Franco.json"
    );
  });

  it("converts blob URL to edit URL", () => {
    const blob = "https://github.com/org/repo/blob/main/profiles";
    assert.equal(
      buildGithubProfileFileUrl(blob, "A B"),
      "https://github.com/org/repo/edit/main/profiles/A%20B.json"
    );
  });
});
