import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  initMetaPixel,
  isTrackablePath,
  metaPixelSnippet,
  resetMetaPixelForTests,
  trackEvent,
  trackPageView,
} from "@/lib/metaPixel";

const PIXEL_SCRIPT = 'script[src="https://connect.facebook.net/en_US/fbevents.js"]';

const cleanup = () => {
  resetMetaPixelForTests();
  delete window.fbq;
  delete window._fbq;
  document.querySelectorAll(PIXEL_SCRIPT).forEach((el) => el.remove());
  vi.unstubAllEnvs();
};

describe("isTrackablePath", () => {
  it.each(["/", "/en", "/en/pricing", "/hi/about", "/get-started", "/employer/register", "/employee/sign-in/"])(
    "tracks public page %s",
    (path) => expect(isTrackablePath(path)).toBe(true),
  );

  it.each([
    "/employer",
    "/employer/dashboard",
    "/employer/invoice",
    "/employee/profile",
    "/shared-scorecard/abc123",
    "/xx/pricing",
    "/not-a-page",
  ])("skips private or unknown page %s", (path) => expect(isTrackablePath(path)).toBe(false));
});

describe("outside production", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_ENV", "staging");
    vi.stubEnv("VITE_META_PIXEL_ID", "123");
  });
  afterEach(cleanup);

  it("loads nothing and sends nothing", () => {
    expect(metaPixelSnippet()).toBeNull();
    initMetaPixel();
    trackPageView();
    trackEvent("Purchase", { value: 1, currency: "INR" });
    expect(window.fbq).toBeUndefined();
    expect(document.querySelector(PIXEL_SCRIPT)).toBeNull();
  });
});

describe("in production", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_ENV", "production");
    vi.stubEnv("VITE_META_PIXEL_ID", "123");
  });
  afterEach(cleanup);

  it("stays off without a pixel id", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "");
    initMetaPixel();
    expect(window.fbq).toBeUndefined();
  });

  it("injects the script once and inits with autoConfig off", () => {
    initMetaPixel();
    initMetaPixel();
    expect(document.querySelectorAll(PIXEL_SCRIPT)).toHaveLength(1);
    expect(window.fbq.disablePushState).toBe(true);
    expect(window.fbq.allowDuplicatePageViews).toBe(true);
    expect(window.fbq.queue).toEqual([
      ["set", "autoConfig", false, "123"],
      ["init", "123"],
    ]);
  });

  it("does not send a PageView on init", () => {
    initMetaPixel();
    expect(window.fbq.queue.some(([, name]) => name === "PageView")).toBe(false);
    trackPageView();
    expect(window.fbq.queue.at(-1)).toEqual(["track", "PageView"]);
  });

  it("renders a head snippet that inits without a PageView", () => {
    new Function(metaPixelSnippet())();
    expect(document.querySelectorAll(PIXEL_SCRIPT)).toHaveLength(1);
    expect(window.fbq.queue).toEqual([
      ["set", "autoConfig", false, "123"],
      ["init", "123"],
    ]);
  });

  it("does not load the script twice after the head snippet ran", () => {
    new Function(metaPixelSnippet())();
    initMetaPixel();
    trackPageView();
    expect(document.querySelectorAll(PIXEL_SCRIPT)).toHaveLength(1);
    expect(window.fbq.queue.filter(([method]) => method === "init")).toHaveLength(1);
    expect(window.fbq.queue.at(-1)).toEqual(["track", "PageView"]);
  });

  it("initialises on first event and passes the event id", () => {
    trackEvent("Purchase", { value: 499, currency: "INR" }, "pay_1");
    expect(window.fbq.queue.at(-1)).toEqual([
      "track",
      "Purchase",
      { value: 499, currency: "INR" },
      { eventID: "pay_1" },
    ]);
  });
});
