#!/usr/bin/env node
/**
 * Post-build: adds modulepreload hints for each prerendered page's catalogs.
 *
 * entry.client.jsx waits for them before hydrating, and they sit behind dynamic
 * imports Vite can't preload, so without these the fetch would only start once
 * the entry chunk runs. The namespaces come from the handles of the routes the
 * page matched, the same list entry.client.jsx reads at runtime.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import routerConfig from "../react-router.config.js";
import { namespaceLocales } from "../app/i18n/config.js";
import { routeNamespaces } from "./lib/routeNamespaces.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const clientDir = path.join(root, "build", "client");
const assetsDir = path.join(clientDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("preload-catalogs: build/client/assets not found — run the build first.");
  process.exit(1);
}

// "i18n-hi-legalTerms-CbCvcOit.js" -> "hi/legalTerms". Matching known names
// avoids guessing where the hash starts, since it can contain a dash.
const names = [
  "index",
  ...fs.readdirSync("app/i18n/messages/en").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)),
];
const chunkName = new RegExp(`^i18n-([a-z]{2})-(${names.join("|")})-[^.]+\\.js$`);
const chunks = new Map();
for (const file of fs.readdirSync(assetsDir)) {
  const m = file.match(chunkName);
  if (m) chunks.set(`${m[1]}/${m[2]}`, `/assets/${file}`);
}

let patched = 0;
const missing = new Set();

for (const route of routerConfig.prerender ?? []) {
  const file = path.join(clientDir, route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) continue;

  const html = fs.readFileSync(file, "utf8");
  const lang = route.split("/")[1];
  const routeIds = [...html.matchAll(/"(routes\/[^"]+)":route\d+/g)].map((m) => m[1]);
  const namespaces = [...new Set(routeIds.flatMap(routeNamespaces))].filter((ns) =>
    namespaceLocales(ns).includes(lang),
  );

  const hrefs = [];
  for (const name of ["index", ...namespaces]) {
    const href = chunks.get(`${lang}/${name}`);
    if (href) hrefs.push(href);
    else missing.add(`${lang}/${name}`);
  }

  const tags = hrefs
    .filter((href) => !html.includes(`"${href}"`))
    .map((href) => `<link rel="modulepreload" href="${href}"/>`)
    .join("");
  if (!tags) continue;

  fs.writeFileSync(file, html.replace("</head>", `${tags}</head>`));
  patched++;
}

if (missing.size) {
  console.error(`preload-catalogs: no chunk built for ${[...missing].join(", ")}`);
  process.exit(1);
}

console.log(`preload-catalogs: ${patched} pages given catalog preload hints.`);
