import { describe, expect, it } from "vitest";
import { searchAuto, searchLiteralNormalized } from "./strategies.js";

describe("searchLiteralNormalized", () => {
  it("finds case-insensitive ASCII", () => {
    const m = searchLiteralNormalized("Hello ERROR world", "error");
    expect(m).toHaveLength(1);
    expect(m[0]!.start).toBe(6);
    expect(m[0]!.line).toBe(1);
  });
});

describe("searchAuto", () => {
  it("falls back to no-accents when literal fails", () => {
    const hay = "Café résumé";
    const chain = searchAuto(hay, "resume");
    const last = chain[chain.length - 1];
    expect(last?.strategyId).toBe("literalNormalizedNoAccents");
    expect(last?.matches.length).toBeGreaterThan(0);
  });
});
