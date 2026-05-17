import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { uploadSecondsFromResponse } from "./complete-pdf-response.js";

describe("uploadSecondsFromResponse", () => {
  it("sums server timing headers", () => {
    const response = {
      headers: {
        get: (name) => {
          if (name === "X-Pdf-Generate-Ms") return "1500";
          if (name === "X-Drive-Upload-Ms") return "500";
          return null;
        },
      },
    };
    assert.equal(uploadSecondsFromResponse(response, true, 0), 2);
  });

  it("uses wall clock when headers missing", () => {
    const response = { headers: { get: () => null } };
    assert.equal(uploadSecondsFromResponse(response, true, 2500), 2);
  });
});
