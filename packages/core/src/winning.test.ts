import { describe, expect, it } from "vitest";
import { getWinningMatches } from "./winning.js";

describe("getWinningMatches", () => {
  it("returns literal in auto mode", () => {
    const w = getWinningMatches("abc ERROR def", "error", "auto");
    expect(w?.strategyId).toBe("literalNormalized");
    expect(w?.matches.length).toBe(1);
  });

  it("returns null when missing", () => {
    expect(getWinningMatches("abc", "zzz", "auto")).toBeNull();
  });
});
