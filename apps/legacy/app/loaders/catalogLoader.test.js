import { beforeEach, describe, expect, it, vi } from "vitest";

const loadCatalogs = vi.fn();
const preferredLocale = vi.fn(() => "en");

vi.mock("@/i18n/loadCatalogs", () => ({ loadCatalogs }));
vi.mock("@/i18n/hooks", () => ({ preferredLocale }));

const { catalogLoader } = await import("./catalogLoader");

beforeEach(() => {
  loadCatalogs.mockClear();
  preferredLocale.mockClear().mockReturnValue("en");
});

describe("locale resolution", () => {
  it("uses the :lang param on a prefixed route", async () => {
    await catalogLoader(["common"])({ params: { lang: "ta" } });
    expect(loadCatalogs).toHaveBeenCalledWith("ta", expect.any(Array));
    expect(preferredLocale).not.toHaveBeenCalled();
  });

  it("falls back to the stored locale when there is no :lang", async () => {
    preferredLocale.mockReturnValue("ar");
    await catalogLoader(["common"])({ params: {} });
    expect(loadCatalogs).toHaveBeenCalledWith("ar", expect.any(Array));
  });

  it("falls back when :lang is not a locale we recognise", async () => {
    // /employer/:jobId-style params must not be mistaken for a language.
    preferredLocale.mockReturnValue("de");
    await catalogLoader(["common"])({ params: { lang: "not-a-locale" } });
    expect(loadCatalogs).toHaveBeenCalledWith("de", expect.any(Array));
  });

  it("tolerates a call with no params at all", async () => {
    await catalogLoader(["common"])({});
    expect(loadCatalogs).toHaveBeenCalledWith("en", expect.any(Array));
  });
});

describe("namespaces and the wrapped loader", () => {
  it("loads the namespaces it was given", async () => {
    await catalogLoader(["legal", "legalTerms"])({ params: { lang: "en" } });
    expect(loadCatalogs).toHaveBeenCalledWith("en", ["legal", "legalTerms"]);
  });

  it("returns the inner loader's value", async () => {
    const inner = vi.fn(async () => ({ job: 42 }));
    const result = await catalogLoader(["common"], inner)({ params: {} });
    expect(result).toEqual({ job: 42 });
  });

  it("returns null when there is no inner loader", async () => {
    expect(await catalogLoader(["common"])({ params: {} })).toBeNull();
  });

  it("runs the inner loader before loading catalogs", async () => {
    const order = [];
    loadCatalogs.mockImplementation(async () => order.push("catalogs"));
    const inner = vi.fn(async () => order.push("loader"));
    await catalogLoader(["common"], inner)({ params: {} });
    expect(order).toEqual(["loader", "catalogs"]);
  });
});
