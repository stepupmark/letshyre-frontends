// Tracks which translated catalogs a human has actually read.
//
// The other i18n gates prove a catalog is structurally sound — every key
// present, placeholders intact, no stray English. None of them can tell you
// whether the Tamil terms of service say what the English ones say. Only a
// native speaker can, and this is where that gets recorded.
//
// A review is bound to a hash of the file it was performed against, so a
// catalog edited after sign-off drops back to unreviewed instead of carrying
// a stale approval. Locale/namespace pairs listed in "requireReviewed" fail
// the build until they are reviewed — start with the legal namespaces once
// they have been through review, and the list becomes a ratchet.
//
//   node scripts/check-i18n-review.mjs
//   node scripts/check-i18n-review.mjs --record hi/legalTerms.json "Reviewer Name"

import { createHash } from "crypto";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { namespaceLocales } from "../app/i18n/config.js";

const DIR = "app/i18n/messages";
const RECORD = "scripts/i18n-review.json";

const raw = readFileSync(RECORD, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const record = JSON.parse(raw);

const hash = (target) =>
  createHash("sha256").update(readFileSync(`${DIR}/${target}`)).digest("hex").slice(0, 16);

const locales = readdirSync(DIR).filter((d) => !d.endsWith(".js") && d !== "en");
const namespaces = readdirSync(`${DIR}/en`).filter((f) => f.endsWith(".json"));
const all = locales.flatMap((l) =>
  namespaces
    .filter((n) => namespaceLocales(n.replace(/\.json$/, "")).includes(l))
    .map((n) => `${l}/${n}`),
);

const [flag, target, reviewer] = process.argv.slice(2);

if (flag === "--record") {
  if (!target || !reviewer) {
    console.error('usage: node scripts/check-i18n-review.mjs --record <locale>/<file> "<reviewer>"');
    process.exit(1);
  }
  if (!all.includes(target)) {
    console.error(`check-i18n-review: ${target} is not a translated catalog`);
    process.exit(1);
  }
  record.reviews[target] = {
    by: reviewer,
    at: new Date().toISOString().slice(0, 10),
    hash: hash(target),
  };
  const sorted = Object.fromEntries(Object.entries(record.reviews).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(RECORD, (JSON.stringify({ ...record, reviews: sorted }, null, 2) + "\n").replace(/\n/g, eol));
  console.log(`recorded: ${target} reviewed by ${reviewer}`);
  process.exit(0);
}

const stale = [];
const unknown = [];
for (const [key, entry] of Object.entries(record.reviews)) {
  if (!all.includes(key)) {
    unknown.push(key);
    continue;
  }
  if (hash(key) !== entry.hash) stale.push(`${key} — reviewed by ${entry.by} on ${entry.at}, changed since`);
}

const reviewed = new Set(
  Object.keys(record.reviews).filter((k) => all.includes(k) && hash(k) === record.reviews[k].hash),
);
const missing = (record.requireReviewed ?? []).filter((k) => !reviewed.has(k));

if (stale.length || unknown.length || missing.length) {
  if (stale.length) {
    console.error(`\nFAIL  stale review (${stale.length}) — re-review, then re-record`);
    for (const s of stale) console.error(`  ${s}`);
  }
  if (unknown.length) {
    console.error(`\nFAIL  unknown catalog (${unknown.length})`);
    for (const u of unknown) console.error(`  ${u}`);
  }
  if (missing.length) {
    console.error(`\nFAIL  required but unreviewed (${missing.length})`);
    for (const m of missing) console.error(`  ${m}`);
  }
  process.exit(1);
}

const pct = Math.round((reviewed.size / all.length) * 100);
console.log(`i18n review OK — ${reviewed.size}/${all.length} catalogs reviewed (${pct}%)`);
if (reviewed.size < all.length) {
  const legal = all.filter((k) => k.includes("/legal") && !reviewed.has(k));
  if (legal.length) console.log(`  ${legal.length} legal catalogs are live and unreviewed`);
}
