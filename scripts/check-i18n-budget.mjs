// Fails the build if a catalog chunk or one locale's catalogs as a whole grow
// past their limit, or if a catalog was built without its own chunk (it merged
// into something bigger).

import { readdirSync, statSync } from "fs";
import { join } from "path";

// Raw bytes. The largest catalog today is ta/legalTerms at ~27 KB; a namespace
// that outgrows this should be split, not given a higher limit.
const LIMIT = 32_000;
// Everything one locale has, the most a visitor could download over a session.
// Today's largest is ta at ~255 KB.
const LOCALE_LIMIT = 285_000;
const assetsDir = "build/client/assets";
const messagesDir = "app/i18n/messages";

const locales = readdirSync(messagesDir).filter((d) => !d.endsWith(".js"));
const catalogs = locales.flatMap((locale) =>
  readdirSync(join(messagesDir, locale))
    .filter((f) => f.endsWith(".json"))
    .map((f) => `${locale}-${f.slice(0, -5)}`),
);

let files;
try {
  files = readdirSync(assetsDir);
} catch {
  console.error("check-i18n-budget: build/client/assets not found — run the build first");
  process.exit(1);
}

let failed = false;
const localeTotals = new Map();
for (const catalog of catalogs) {
  const chunk = files.find((f) => f.startsWith(`i18n-${catalog}-`) && f.endsWith(".js"));
  if (!chunk) {
    console.error(`FAIL  no chunk for ${catalog}`);
    failed = true;
    continue;
  }
  const size = statSync(join(assetsDir, chunk)).size;
  const locale = catalog.slice(0, catalog.indexOf("-"));
  localeTotals.set(locale, (localeTotals.get(locale) ?? 0) + size);
  if (size > LIMIT) {
    console.error(`FAIL  ${chunk}  ${size} B  (limit ${LIMIT} B)`);
    failed = true;
  }
}

for (const [locale, total] of localeTotals) {
  if (total > LOCALE_LIMIT) {
    console.error(`FAIL  ${locale} catalogs  ${total} B  (limit ${LOCALE_LIMIT} B)`);
    failed = true;
  }
}

if (failed) process.exit(1);
const largest = Math.max(...localeTotals.values());
console.log(`i18n budget OK — ${catalogs.length} chunks, all ≤ ${LIMIT} B; largest locale ${largest} B (limit ${LOCALE_LIMIT} B)`);
