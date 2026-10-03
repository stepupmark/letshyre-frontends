// Fails the build when a prerendered page has an accessibility defect axe can
// see in static markup. The eslint jsx-a11y-style rules only catch what is
// literally written in one JSX file; a heading level that only skips once the
// layout, the page and the section are composed together is invisible to them
// and obvious here, because the build already emits the finished HTML.
//
// jsdom does no layout and paints nothing, so every rule that needs computed
// geometry or rendered colour is unavailable: colour contrast, target size,
// scrollable-region focus, anything about what actually overlaps what. Those
// still need a real browser (pa11y/CI) — RULES below is deliberately limited to
// what static markup can honestly answer: landmarks, heading order, image alt
// text, form labels, accessible names, document language, ARIA validity, list
// and table structure.
//
// Pages are keyed with the locale prefix collapsed to "*": the 152 prerendered
// pages are 8 routes times 19 locales, and a markup defect is in the component,
// not the translation, so listing it 19 times would only make the allowlist
// unreadable. A violation on one locale but not another still fails, because
// its key is the same and the entry it needs does not exist.

import { readFileSync } from "fs";
import { JSDOM, VirtualConsole } from "jsdom";
import axe from "axe-core";
import routerConfig from "../react-router.config.js";
import { LOCALES } from "../app/i18n/config.js";

const RULES = [
  "landmark-one-main",
  "landmark-unique",
  "landmark-no-duplicate-banner",
  "landmark-no-duplicate-contentinfo",
  "region",
  "heading-order",
  "empty-heading",
  "image-alt",
  "input-image-alt",
  "label",
  "form-field-multiple-labels",
  "link-name",
  "button-name",
  "html-has-lang",
  "html-lang-valid",
  "html-xml-lang-mismatch",
  "valid-lang",
  "duplicate-id-aria",
  "aria-allowed-attr",
  "aria-allowed-role",
  "aria-required-attr",
  "aria-required-children",
  "aria-required-parent",
  "aria-roles",
  "aria-valid-attr",
  "aria-valid-attr-value",
  "list",
  "listitem",
  "definition-list",
  "dlitem",
  "td-headers-attr",
  "th-has-data-cells",
];

// Format: "<route with the locale segment as *>:<rule>:<css target>".
const ALLOWLIST = new Set([]);

const routes = (routerConfig.prerender ?? []).filter(
  (r) => typeof r === "string" && r.startsWith("/"),
);

const fileFor = (route) =>
  route === "/" ? "build/client/index.html" : `build/client${route}/index.html`;

const localePattern = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`);
const pageOf = (route) => route.replace(localePattern, "/*");

// jsdom logs a "getContext() not implemented" error for every canvas axe probes.
const virtualConsole = new VirtualConsole();

const stale = [...ALLOWLIST];
const offenders = new Map();

for (const route of routes) {
  let html;
  try {
    html = readFileSync(fileFor(route), "utf8");
  } catch {
    console.error(`check-a11y: no prerendered HTML for ${route} — run the build first`);
    process.exit(1);
  }

  const dom = new JSDOM(html, { runScripts: "outside-only", virtualConsole });
  dom.window.eval(axe.source);
  const result = await dom.window.axe.run(dom.window.document, {
    runOnly: { type: "rule", values: RULES },
  });
  dom.window.close();

  for (const violation of result.violations) {
    for (const node of violation.nodes) {
      const key = `${pageOf(route)}:${violation.id}:${node.target.join(" ")}`;
      if (ALLOWLIST.has(key)) {
        const at = stale.indexOf(key);
        if (at !== -1) stale.splice(at, 1);
        continue;
      }
      if (!offenders.has(key)) offenders.set(key, `${violation.impact} — ${violation.help}`);
    }
  }
}

if (offenders.size) {
  console.error("FAIL  accessibility violations in the prerendered HTML:");
  for (const [key, help] of offenders) console.error(`  ${key}  ${help}`);
  process.exit(1);
}

// A stale entry means the markup moved or was fixed; left in place it would
// silently excuse whatever lands on that selector next.
if (stale.length) {
  console.error("FAIL  stale ALLOWLIST entries — remove or re-point them:");
  for (const entry of stale) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(`a11y OK — ${routes.length} prerendered pages, ${RULES.length} axe rules`);
