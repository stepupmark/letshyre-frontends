import { describe, expect, it } from "vitest";
import { experienceText, parseRange, salaryText } from "./jobRanges";

describe("salaryText / experienceText", () => {
  it("formats a range the way candidates see it", () => {
    expect(salaryText(10, 15)).toBe("10 - 15 LPA");
    expect(experienceText(2, 5)).toBe("2-5 years");
  });

  it("handles one side only", () => {
    expect(salaryText(12, null)).toBe("12 LPA");
    expect(salaryText("", 20)).toBe("Up to 20 LPA");
    expect(experienceText(3, undefined)).toBe("3 years");
    expect(experienceText(null, 4)).toBe("Up to 4 years");
  });

  it("keeps zero as a real value", () => {
    expect(experienceText(0, 2)).toBe("0-2 years");
    expect(salaryText(0, 5)).toBe("0 - 5 LPA");
  });

  it("returns nothing when neither side is set", () => {
    expect(salaryText(null, "")).toBe("");
    expect(experienceText(undefined, null)).toBe("");
  });
});

describe("parseRange", () => {
  it("reads both numbers", () => {
    expect(parseRange("10 - 15 LPA")).toEqual({ min: 10, max: 15 });
    expect(parseRange("1-3 years")).toEqual({ min: 1, max: 3 });
    expect(parseRange("7.5 - 12.5 LPA")).toEqual({ min: 7.5, max: 12.5 });
  });

  it("reads a single number as the minimum", () => {
    expect(parseRange("12 LPA")).toEqual({ min: 12, max: "" });
  });

  it("reads 'Up to' as the maximum", () => {
    expect(parseRange("Up to 5 years")).toEqual({ min: "", max: 5 });
  });

  it("round-trips what salaryText and experienceText produce", () => {
    expect(parseRange(salaryText(10, 15))).toEqual({ min: 10, max: 15 });
    expect(parseRange(experienceText(null, 4))).toEqual({ min: "", max: 4 });
  });

  it("returns null for text with no numbers", () => {
    expect(parseRange("Competitive")).toBeNull();
    expect(parseRange("")).toBeNull();
    expect(parseRange(null)).toBeNull();
  });
});
