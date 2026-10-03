import { describe, expect, it } from "vitest";
import {
  LOCALES,
  LOCALE_ENGLISH_NAMES,
  LOCALE_NAMES,
  localesForPage,
  namespaceLocales,
  prerenderPaths,
} from "./config";

describe("locale names", () => {
  it("has a native and an English name for every locale", () => {
    for (const code of LOCALES) {
      expect(LOCALE_NAMES[code], code).toBeTruthy();
      expect(LOCALE_ENGLISH_NAMES[code], code).toBeTruthy();
    }
  });
});

describe("English-only pages", () => {
  it("prerenders pricing in English only", () => {
    const pricing = prerenderPaths().filter((path) => path.endsWith("/pricing"));
    expect(pricing).toEqual(["/en/pricing"]);
  });

  it("advertises pricing in English only", () => {
    expect(localesForPage("/pricing")).toEqual(["en"]);
    expect(namespaceLocales("pricing")).toEqual(["en"]);
  });

  it("keeps every other page in every locale", () => {
    expect(localesForPage("/about")).toEqual(LOCALES);
    expect(namespaceLocales("common")).toEqual(LOCALES);
    expect(prerenderPaths()).toContain("/ar/refund-policy");
  });
});
