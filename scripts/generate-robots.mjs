#!/usr/bin/env node
/**
 * Generates robots.txt, gated on VITE_ENV so staging/preview builds never
 * advertise themselves to crawlers by accident. Only VITE_ENV=production
 * ships the indexable, real ruleset; every other value (including unset)
 * defaults to a Disallow-all file — safe-by-default beats forgetting to
 * flip a flag before a staging deploy.
 *
 * Runs after `react-router build` and writes into build/client (the site
 * root nginx serves), so robots.txt is a build artifact — never committed, never
 * stale. Falls back to writing into public/ if build/client doesn't exist yet.
 */
import "./lib/env.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SITE } from "../app/lib/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const isProduction = process.env.VITE_ENV === "production";

const productionRobots = `# LetsHyre — robots.txt
# ${SITE.url}/robots.txt

User-agent: *
Allow: /

# Signed-in areas. These never prerender a robots directive, so blocking is
# the only way to keep them out. Auth and 404 pages are deliberately NOT
# blocked — they carry noindex, which a crawler has to fetch the page to read.
Disallow: /employee/
Disallow: /*/employee/
Disallow: /employer/
Disallow: /*/employer/

# Sitemap
Sitemap: ${SITE.url}/sitemap.xml
`;

const disallowAllRobots = `User-agent: *
Disallow: /
`;

const content = isProduction ? productionRobots : disallowAllRobots;

const buildDir = path.join(root, "build", "client");
const outDir = fs.existsSync(buildDir) ? buildDir : path.join(root, "public");
const outFile = path.join(outDir, "robots.txt");

fs.writeFileSync(outFile, content, "utf8");
console.log(
  isProduction
    ? `robots.txt: production (indexable) -> ${path.relative(root, outFile)}`
    : `robots.txt: staging/preview (noindex) -> ${path.relative(root, outFile)}`,
);
