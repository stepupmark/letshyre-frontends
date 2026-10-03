#!/usr/bin/env node
/**
 * Post-build SEO gate: asserts every prerendered page shipped with the critical
 * tags baked in. Because ssr:false relies on the prerender step running each
 * route's meta() at build time, a broken/removed meta() export fails silently —
 * the page just ships with an empty <head>. This catches that before deploy.
 *
 * Routes come from `prerender` in react-router.config.js and the domain from
 * app/lib/seo.js, so this checks exactly what the build emits. Exits non-zero
 * (failing `pnpm build`) if any page is missing a required tag.
 */
import "./lib/env.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import routerConfig from "../react-router.config.js";
import { SITE, absUrl } from "../app/lib/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const clientDir = path.join(root, "build", "client");

if (!fs.existsSync(clientDir)) {
  console.error("verify-seo: build/client not found — run the build first.");
  process.exit(1);
}

// route "/" -> index.html; "/about" -> about/index.html
const fileFor = (route) =>
  route === "/"
    ? path.join(clientDir, "index.html")
    : path.join(clientDir, route.replace(/^\//, ""), "index.html");

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'");

const tag = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]).trim() : "";
};

const titleOf = (h) => tag(h, /<title>([^<]*)<\/title>/i);
const descOf = (h) =>
  tag(h, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
const canonicalOf = (h) =>
  tag(h, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
const ogImageOf = (h) =>
  tag(h, /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
const alternatesOf = (h) =>
  [...h.matchAll(/rel=["']alternate["'][^>]*href=["']([^"']*)["']/gi)].map((m) =>
    decode(m[1]),
  );

// Search results are cut by pixel width, not character count. CJK glyphs are
// about twice as wide, so a Japanese description of 42 characters carries as
// much as an English one of 84 — count those as two.
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
const width = (s) => [...s].reduce((n, ch) => n + (WIDE.test(ch) ? 2 : 1), 0);

// The suffix every page title ends with: "<page> | <bare domain>".
const SUFFIX = ` | ${new URL(SITE.url).host.replace(/^www\./, "")}`;
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

// Each check is [label, test]. test returns true when the page is correct.
const checks = [
  ["non-empty <title>", (h) => titleOf(h).length > 0],
  [`title ends with "${SUFFIX.trim()}"`, (h) => titleOf(h).endsWith(SUFFIX)],
  [`title <= ${TITLE_MAX} wide`, (h) => width(titleOf(h)) <= TITLE_MAX],
  [
    `description ${DESC_MIN}-${DESC_MAX} wide`,
    (h) => width(descOf(h)) >= DESC_MIN && width(descOf(h)) <= DESC_MAX,
  ],
  ["canonical link", (h) => canonicalOf(h).length > 0],
  // A canonical pointing anywhere but the page's own URL hands the ranking to
  // whatever it points at.
  ["canonical is self-referential", (h, route) => canonicalOf(h) === absUrl(route)],
  ["og:title", (h) => /property=["']og:title["']/i.test(h)],
  ["og:image", (h) => ogImageOf(h).length > 0],
  [
    "og:image file exists",
    (h) =>
      ogImageOf(h).startsWith(SITE.url) &&
      fs.existsSync(path.join(clientDir, ogImageOf(h).slice(SITE.url.length))),
  ],
  ["og:locale", (h) => /property=["']og:locale["']/i.test(h)],
  ["twitter:card", (h) => /name=["']twitter:card["']/i.test(h)],
  ["JSON-LD", (h) => /application\/ld\+json/i.test(h)],
  // publisher/isPartOf name their target by @id, and a crawler only resolves
  // an @id defined on the same page.
  [
    "JSON-LD @id references resolve",
    (h) => {
      const defined = new Set();
      const referenced = new Set();
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (!node || typeof node !== "object") return;
        if (typeof node["@id"] === "string") {
          (node["@type"] ? defined : referenced).add(node["@id"]);
        }
        Object.values(node).forEach(walk);
      };
      const blocks = h.matchAll(
        /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
      );
      for (const block of blocks) {
        try {
          walk(JSON.parse(block[1]));
        } catch {
          return false;
        }
      }
      return [...referenced].every((id) => defined.has(id));
    },
  ],
  ["hreflang alternates", (h) => alternatesOf(h).length > 0],
  ["hreflang x-default", (h) => /hreflang=["']x-default["']/i.test(h)],
  // A page missing from its own hreflang set is dropped from the cluster.
  ["hreflang includes self", (h, route) => alternatesOf(h).includes(absUrl(route))],
  ["indexable", (h) => !/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(h)],
  // Meta tags alone passed while every page shipped as an empty hydrate
  // fallback: a route that gains a clientLoader stops prerendering its
  // component, and nothing here noticed. Assert the body actually rendered.
  ["prerendered body content", (h) => /<h1[\s>]/i.test(h)],
  ["exactly one <h1>", (h) => (h.match(/<h1[\s>]/gi) ?? []).length === 1],
];

const routes = (routerConfig.prerender ?? []).filter(
  (r) => typeof r === "string" && r.startsWith("/"),
);

let failed = 0;
const pages = new Map();

for (const route of routes) {
  const file = fileFor(route);
  if (!fs.existsSync(file)) {
    console.error(`✖ ${route} — no prerendered HTML at ${path.relative(root, file)}`);
    failed++;
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  pages.set(absUrl(route), html);
  const missing = checks
    .filter(([, test]) => !test(html, route))
    .map(([label]) => label);
  if (missing.length) {
    console.error(`✖ ${route} — missing: ${missing.join(", ")}`);
    failed++;
  } else {
    console.log(`✓ ${route}`);
  }
}

// Cross-page checks — these need the whole set, so they run after the loop.

// Every alternate a page advertises has to be a page that shipped, or the
// cluster is broken in the direction search engines actually follow.
for (const [url, html] of pages) {
  const dangling = alternatesOf(html).filter((href) => !pages.has(href));
  if (dangling.length) {
    console.error(`x ${url} — hreflang points at pages that do not exist: ${dangling.join(", ")}`);
    failed++;
  }
}

// robots.txt and a page's own directive have to agree: a blocked URL is never
// fetched, so a noindex on it is never read and the URL can still be listed.
const robotsFile = path.join(clientDir, "robots.txt");
if (fs.existsSync(robotsFile)) {
  const disallowed = fs
    .readFileSync(robotsFile, "utf8")
    .split("\n")
    .filter((l) => /^Disallow:\s*\S/i.test(l))
    .map((l) => l.slice(l.indexOf(":") + 1).trim())
    .filter((rule) => rule && rule !== "/");
  const matcher = (rule) =>
    new RegExp(
      "^" +
        rule
          .split("*")
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join(".*"),
    );
  for (const route of routes) {
    const blocked = disallowed.filter((rule) => matcher(rule).test(route));
    if (blocked.length) {
      console.error(`x ${route} — in the sitemap but blocked by robots.txt (${blocked.join(", ")})`);
      failed++;
    }
  }
}

// /employee and /employer are auth-gated, client-only routes (ssr:false) with
// no server-rendered content — a crawler indexing them gets an empty shell
// behind a login. They must never reach the sitemap, and robots.txt must keep
// disallowing them explicitly.
const sitemapFile = path.join(clientDir, "sitemap.xml");
if (fs.existsSync(sitemapFile)) {
  const sitemapUrls = [
    ...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]*)<\/loc>/g),
  ].map((m) => decode(m[1]));
  const exposed = sitemapUrls.filter((url) => /\/(employee|employer)(\/|$)/.test(new URL(url).pathname));
  if (exposed.length) {
    console.error(`x sitemap.xml exposes auth-gated routes to indexing: ${exposed.join(", ")}`);
    failed++;
  }
}

if (fs.existsSync(robotsFile)) {
  const robotsTxt = fs.readFileSync(robotsFile, "utf8");
  // A disallow-all robots.txt (staging/preview builds) already blocks
  // /employee and /employer transitively — only the production ruleset needs
  // the explicit rules asserted.
  const blocksAll = /^Disallow:\s*\/\s*$/im.test(robotsTxt);
  if (!blocksAll) {
    const required = ["/employee/", "/*/employee/", "/employer/", "/*/employer/"];
    const missing = required.filter((rule) => !robotsTxt.includes(`Disallow: ${rule}`));
    if (missing.length) {
      console.error(`x robots.txt no longer blocks auth-gated routes — missing: ${missing.join(", ")}`);
      failed++;
    }
  }
}

if (failed) {
  console.error(`\nverify-seo: ${failed} problem(s) across ${routes.length} pages.`);
  process.exit(1);
}
console.log(`\nverify-seo: all ${routes.length} pages passed.`);
