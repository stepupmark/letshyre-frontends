// Meta Pixel. Production builds only, so staging never pollutes the ad account.
//
// PageViews go out for public pages only: the pixel reports the full URL, and
// dashboard URLs carry share tokens and candidate/job ids. autoConfig is off so
// Meta doesn't scrape clicks and form fields on its own.

import { isLocale } from "@/i18n/config";

const SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";

// Register and sign-in pages sit under /employer and /employee but carry
// nothing private in their URLs.
const PUBLIC_PATHS = new Set([
  "/",
  "/get-started",
  "/forgot-password",
  "/employer/register",
  "/employer/sign-in",
  "/employee/register",
  "/employee/sign-in",
]);

let initialised = false;

const pixelId = () =>
  import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_META_PIXEL_ID : "";

export const isMetaPixelEnabled = () => typeof window !== "undefined" && Boolean(pixelId());

export const isTrackablePath = (pathname) => {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PUBLIC_PATHS.has(path) || isLocale(path.split("/")[1]);
};

// Meta's base code, unminified. Also inlined into the page head as a string,
// so it must not reference anything outside itself.
function bootstrap(id, src) {
  if (window.fbq) return;
  const fbq = function (...args) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  // Stops fbevents.js sending its own PageView on every pushState, dashboards
  // included. Once that's off it drops repeat PageViews unless allowed.
  fbq.disablePushState = true;
  fbq.allowDuplicatePageViews = true;
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);

  fbq("set", "autoConfig", false, id);
  fbq("init", id);
}

// Rendered into <head> so the base code is in the page source, where Meta's
// setup check looks for it. No PageView here; useMetaPixel sends those.
export const metaPixelSnippet = () => {
  const id = pixelId();
  return id ? `(${bootstrap})(${JSON.stringify(id)},${JSON.stringify(SCRIPT_SRC)})` : null;
};

export const initMetaPixel = () => {
  if (initialised || !isMetaPixelEnabled()) return;
  initialised = true;
  bootstrap(pixelId(), SCRIPT_SRC);
};

export const trackPageView = () => {
  if (!initialised) return;
  window.fbq("track", "PageView");
};

// Standard events only, never PII in params. eventId lets Meta drop repeats,
// such as a reloaded confirmation page.
export const trackEvent = (name, params = {}, eventId) => {
  initMetaPixel();
  if (!initialised) return;
  window.fbq("track", name, params, eventId ? { eventID: eventId } : undefined);
};

export const resetMetaPixelForTests = () => {
  initialised = false;
};
