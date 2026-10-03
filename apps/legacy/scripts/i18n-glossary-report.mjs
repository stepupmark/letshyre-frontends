// Prints what a native speaker needs to settle the pending glossary terms:
// the variants a locale currently uses, and the strings each one appears in.
// Deciding a term is a judgement call, but finding the evidence isn't — this
// is the part that was making each decision an afternoon instead of a minute.
//
//   node scripts/i18n-glossary-report.mjs          all pending terms
//   node scripts/i18n-glossary-report.mjs fr       one locale

import { readFileSync, readdirSync } from "fs";

const DIR = "app/i18n/messages";
const GLOSSARY = JSON.parse(readFileSync("scripts/i18n-glossary.json", "utf8"));
const only = process.argv[2];

const flat = (v, path = "", out = []) => {
  if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out);
  } else if (typeof v === "string") out.push([path, v]);
  return out;
};

const strings = new Map();
const load = (locale) => {
  if (strings.has(locale)) return strings.get(locale);
  const rows = [];
  for (const file of readdirSync(`${DIR}/${locale}`).filter((f) => f.endsWith(".json"))) {
    for (const [key, value] of flat(JSON.parse(readFileSync(`${DIR}/${locale}/${file}`, "utf8")))) {
      rows.push([`${file}:${key}`, value]);
    }
  }
  strings.set(locale, rows);
  return rows;
};

let pending = 0;

for (const [term, entry] of Object.entries(GLOSSARY)) {
  const locales = Object.entries(entry.locales).filter(
    ([locale, rule]) => rule.status !== "enforced" && (!only || locale === only),
  );
  if (!locales.length) continue;

  console.log(`\n${"=".repeat(72)}\n${term}`);
  if (entry.note) console.log(entry.note);
  console.log();

  for (const [locale, rule] of locales) {
    pending++;
    const variants = [...new Set([...(rule.seen ?? []), rule.use].filter(Boolean))];
    console.log(`  ${locale}  proposed: ${rule.use}`);
    for (const variant of variants) {
      const hits = load(locale).filter(([, v]) => v.includes(variant));
      console.log(`    "${variant}" — ${hits.length} occurrence(s)`);
      for (const [where, value] of hits.slice(0, 3)) {
        console.log(`      ${where}`);
        console.log(`        ${value.length > 110 ? value.slice(0, 110) + "…" : value}`);
      }
      if (hits.length > 3) console.log(`      …and ${hits.length - 3} more`);
    }
    console.log();
  }
}

console.log(`${"=".repeat(72)}`);
console.log(`${pending} pending decision(s)${only ? ` for ${only}` : ""}.`);
console.log(`Settle one by setting "use", listing the rejected variants in "avoid",`);
console.log(`and flipping "status" to "enforced" in scripts/i18n-glossary.json.`);
