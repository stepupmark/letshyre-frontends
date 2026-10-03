// Fails the build when a client JS chunk, or the bundle as a whole, grows past
// its budget. Without a ceiling a chunk creeps up a few KB per PR and nobody
// notices until the app is slow on a phone.
//
// Budgets are gzipped bytes, because that is what the browser actually pulls
// down and raw size moves for reasons (minifier output, comments) that cost the
// user nothing. Numbers are a ratchet, not a target: each one is today's
// measured size plus roughly 10% headroom, so shrinking is free and growth has
// to be argued for by editing this file.
//
// BUDGETS pins the heavyweights individually; everything else shares LIMIT, and
// TOTAL guards the case where twenty small chunks add up to the same problem.
// Per-chunk entries only work for names that are unique after the hash is
// stripped — several vendor chunks land as dist.js/utils.js and can only be
// covered by LIMIT.
//
// MarkdownRenderer and dist (react-joyride) are large but lazy: neither is in
// the route manifest or any prerendered page, so they cost nothing until the
// chatbot answers or the tour starts.
//
// Translation catalogs are left to check-i18n-budget: all 19 locales together
// are over half the output, yet a visitor only ever loads one of them.

import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { gzipSync } from "zlib";

const BUDGETS = {
  "entry.client.js": 63_000,
  "MarkdownRenderer.js": 50_000,
  "proxy.js": 43_000,
  "hooks.js": 30_000,
  "schemas.js": 26_000,
  "api.js": 21_500,
  "employee-main.js": 21_000,
  // Eleven vendor chunks share this name; the entry has to clear the largest,
  // which loosens the other ten. TOTAL is what actually guards them.
  "dist.js": 19_500,
};
const LIMIT = 16_000;
const TOTAL = 725_000;

const assetsDir = "build/client/assets";

let files;
try {
  files = readdirSync(assetsDir).filter((f) => f.endsWith(".js") && !/^i18n-[a-z]{2}-/.test(f));
} catch {
  console.error("check-bundle-budget: build/client/assets not found — run the build first");
  process.exit(1);
}

// Asset names carry a content hash that changes every build, so budgets key on
// the name with the trailing 8-character hash stripped.
const identity = (file) => file.replace(/-[A-Za-z0-9_-]{8}\.js$/, ".js");

const chunks = files.map((file) => {
  const name = identity(file);
  return {
    name,
    size: gzipSync(readFileSync(join(assetsDir, file))).length,
    budget: BUDGETS[name] ?? LIMIT,
  };
});

const total = chunks.reduce((sum, c) => sum + c.size, 0);
const over = chunks.filter((c) => c.size > c.budget).sort((a, b) => b.size - a.size);

if (over.length || total > TOTAL) {
  console.error("FAIL  bundle over budget (gzipped):");
  for (const c of over) console.error(`  ${c.name}  ${c.size} B  (budget ${c.budget} B)`);
  if (total > TOTAL) console.error(`  total  ${total} B  (budget ${TOTAL} B)`);
  process.exit(1);
}

// A stale key means the chunk was renamed or dropped; left alone it would keep
// excusing a budget nothing measures any more.
const unmatched = Object.keys(BUDGETS).filter((name) => !chunks.some((c) => c.name === name));
if (unmatched.length) {
  console.error("FAIL  stale BUDGETS entries — remove or re-point them:");
  for (const name of unmatched) console.error(`  ${name}`);
  process.exit(1);
}

const worst = [...chunks].sort((a, b) => b.size - a.size).slice(0, 5);
console.log(`bundle budget OK — ${chunks.length} chunks, ${total} B gz total (budget ${TOTAL} B)`);
for (const c of worst) console.log(`  ${c.name}  ${c.size} B  (budget ${c.budget} B)`);
