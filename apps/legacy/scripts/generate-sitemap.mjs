#!/usr/bin/env node
/**
 * Generates sitemap.xml from the prerendered public routes.
 *
 * The URL list is derived from `prerender` in react-router.config.js, so it can
 * never drift from what actually ships: add a route to the prerender array and
 * it appears in the sitemap on the next build. The canonical domain comes from
 * app/lib/seo.js, the same source the page meta() uses.
 *
 * Runs after `react-router build` and writes into build/client (the site
 * root nginx serves), so the sitemap is a build artifact — never committed, never
 * stale. Falls back to writing into public/ if build/client doesn't exist yet.
 */
import "./lib/env.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import routerConfig from "../react-router.config.js";
import { SITE, absUrl } from "../app/lib/seo.js";
import { DEFAULT_LOCALE, localePath, localesForPage } from "../app/i18n/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// What each page is actually built from: its component, and the namespace
// holding its copy. lastmod is the newer of the two, per locale.
const SOURCES = {
  "": ["app/features/home/Home.jsx", "home"],
  "/about": ["app/features/about/About.jsx", "about"],
  "/contact": ["app/features/contact/Contact.jsx", "contact"],
  "/download": ["app/features/employee/DownloadApp.jsx", "download"],
  "/how-it-works-interview": ["app/features/how-it-works/HowItWorks.jsx", "interview"],
  "/pricing": ["app/features/pricing/Pricing.jsx", "pricing", "app/features/pricing/lib/plans.js"],
  "/terms": ["app/features/legal/TermsAndConditions.jsx", "legalTerms"],
  "/policy": ["app/features/legal/PrivacyPolicy.jsx", "legalPolicy"],
  "/refund-policy": ["app/features/legal/RefundPolicy.jsx", "legalRefund"],
};

const xmlEscape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const dates = new Map();
const commitDate = (file) => {
  if (dates.has(file)) return dates.get(file);
  let date = "";
  try {
    date = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    date = "";
  }
  dates.set(file, date);
  return date;
};

// A lastmod that moves on every deploy is treated as noise, so date each URL
// from the commits that actually changed it. Falls back to today when git
// isn't available (a shallow CI checkout, a tarball build).
const today = new Date().toISOString().slice(0, 10);
const lastmodFor = (suffix, lang) => {
  const source = SOURCES[suffix];
  if (!source) return today;
  const [component, namespace, ...extra] = source;
  const seen = [
    commitDate(component),
    commitDate(`app/i18n/messages/${lang}/${namespace}.json`),
    ...extra.map(commitDate),
  ].filter(Boolean);
  return seen.length ? seen.sort().at(-1) : today;
};

const routes = (routerConfig.prerender ?? []).filter(
  (r) => typeof r === "string" && r.startsWith("/"),
);

// Strip the /<lang> prefix. "" is home; "/about" etc. otherwise.
const suffix = (route) => route.replace(/^\/[a-z]{2}(?=\/|$)/, "");

const urls = routes
  .map((route) => {
    const sfx = suffix(route);
    const lang = route.split("/")[1];
    // Every locale that ships this page, plus x-default -> default locale.
    const alternates = [...localesForPage(sfx), "x-default"].map((loc) => {
      const href = absUrl(localePath(loc === "x-default" ? DEFAULT_LOCALE : loc, sfx));
      return `    <xhtml:link rel="alternate" hreflang="${loc}" href="${xmlEscape(href)}" />`;
    });
    return [
      "  <url>",
      `    <loc>${xmlEscape(absUrl(route))}</loc>`,
      ...alternates,
      `    <lastmod>${lastmodFor(sfx, lang)}</lastmod>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">

${urls}

</urlset>
`;

const buildDir = path.join(root, "build", "client");
const outDir = fs.existsSync(buildDir) ? buildDir : path.join(root, "public");
const outFile = path.join(outDir, "sitemap.xml");

fs.writeFileSync(outFile, xml, "utf8");
console.log(
  `sitemap.xml: ${routes.length} urls -> ${path.relative(root, outFile)} (${SITE.url})`,
);
