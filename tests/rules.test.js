import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeUrl } from "../extension/rules.js";

describe("analyzeUrl: legitimate URLs", () => {
  it("plain https site is Safe with no reasons", () => {
    const r = analyzeUrl("https://www.google.com/");
    assert.equal(r.score, 0);
    assert.equal(r.level, "Safe");
    assert.deepEqual(r.reasons, []);
  });
});

describe("analyzeUrl: false-positive prevention", () => {
  it("ignores keywords in the query string", () => {
    const r = analyzeUrl("https://www.google.com/search?q=verify-urgent-claim");
    assert.equal(r.score, 0);
    assert.equal(r.level, "Safe");
  });

  it("ignores keywords in the fragment", () => {
    const r = analyzeUrl("https://example.com/page?next=login&verify=1#claim");
    assert.equal(r.score, 0);
  });
});

describe("analyzeUrl: HTTP rule", () => {
  it("flags plain http with +2 and an explanation", () => {
    const r = analyzeUrl("http://example.com/");
    assert.equal(r.score, 2);
    assert.equal(r.level, "Suspicious");
    assert.equal(r.reasons.length, 1);
  });
});

describe("analyzeUrl: keyword rule", () => {
  it("one keyword is a weak signal (Safe)", () => {
    const r = analyzeUrl("https://example.com/verify");
    assert.equal(r.score, 1);
    assert.equal(r.level, "Safe");
    assert.match(r.reasons[0], /verify/);
  });

  it("matches case-insensitively", () => {
    const r = analyzeUrl("https://example.com/VERIFY");
    assert.equal(r.score, 1);
  });

  it("three keywords give +3", () => {
    const r = analyzeUrl("https://example.com/verify-urgent-claim");
    assert.equal(r.score, 3);
    assert.equal(r.level, "Suspicious");
  });

  it("caps keyword points at +3", () => {
    const r = analyzeUrl("https://verify-urgent-claim-reward.example.com/");
    assert.equal(r.score, 3);
  });
});

describe("analyzeUrl: combined signals", () => {
  it("http + three keywords is High Risk", () => {
    const r = analyzeUrl("http://neverssl.com/verify-urgent-claim");
    assert.equal(r.score, 5);
    assert.equal(r.level, "High Risk");
    assert.equal(r.reasons.length, 2);
  });
});

describe("analyzeUrl: inputs that cannot be scanned", () => {
  for (const input of ["not a url", "", "ftp://example.com", "chrome://extensions", "about:blank"]) {
    it(`does not crash on ${JSON.stringify(input)}`, () => {
      const r = analyzeUrl(input);
      assert.equal(r.level, "Can't scan");
      assert.equal(r.score, 0);
      assert.equal(r.reasons.length, 1);
    });
  }

  it("does not crash on undefined", () => {
    assert.equal(analyzeUrl(undefined).level, "Can't scan");
  });
});