// Content checks the key-parity script can't make. Parity proves a locale has
// every key; this proves the value in it is usable:
//
//   encoding      no BOM, no replacement chars, no Latin-1 mojibake
//   markup        <hl>/<br/>/<dl> tags match English, or <Trans> renders raw text
//   interpolation {{vars}} match English, allowing plural forms to hardcode a number
//   arrays        same length as English, since key parity treats an array as a leaf
//   brand         "LetsHyre", never "Letshyre"
//   domains       no locale inventing a domain English doesn't use
//   glossary      terms marked "enforced" in i18n-glossary.json
//   leftovers     prose sitting untranslated, byte-identical to English
//   english       an English function word left inside a non-Latin translation
//
// Every one of these fired on real damage found during the September audit.

import { readFileSync, readdirSync } from "fs";

const DIR = "app/i18n/messages";
const GLOSSARY = JSON.parse(readFileSync("scripts/i18n-glossary.json", "utf8"));

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
const MOJIBAKE = ["â€", "Ã©", "Â "];

// English kept on purpose: industry terms, a signature block, brand names and
// field abbreviations that read the same in every locale we ship.
const SHARED_WITH_EN = new Set([
  "Notice Period", "LetsHyre Support Team", "Part Time",
  "LinkedIn URL", "Min LPA", "Max LPA",
]);

const locales = readdirSync(DIR).filter((d) => !d.endsWith(".js"));
const others = locales.filter((l) => l !== "en");
const files = readdirSync(`${DIR}/en`).filter((f) => f.endsWith(".json"));

const flat = (v, path = "", out = {}) => {
  if (Array.isArray(v)) {
    out[`${path}#len`] = v.length;
    v.forEach((x, i) => flat(x, `${path}[${i}]`, out));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out);
  } else out[path] = v;
  return out;
};

const tags = (s) => (s.match(/<\/?[a-zA-Z][^>]*>/g) || []).map((t) => t.replace(/\s+[^>]*(?=\/?>)/, "")).sort();
const vars = (s) => [...new Set(s.match(/\{\{\s*[\w.]+\s*\}\}/g) || [])].map((v) => v.replace(/\s/g, "")).sort();
// Only our own domains — a localized example address like empresa.com is fine.
const domains = (s) => (s.match(/letshyre\.[a-z]{2,}/gi) || []).map((d) => d.toLowerCase());
// Section ids and block types are structural, not copy.
const isStructural = (key) => /\.(id|type)$/.test(key);

// A string is only worth translating if something remains once placeholders,
// the brand and punctuation are taken out. "{{count}} / 500" never changes.
const translatableWords = (s) =>
  s.replace(/\{\{[^}]*\}\}/g, " ").replace(/LetsHyre/gi, " ")
    .match(/[A-Za-z]{3,}/g) || [];

// A locale written in its own script has no reason to contain an English
// function word — when one survives, the sentence around it was only partly
// translated. Latin-script locales are excluded: "in", "is" and "or" are real
// words in several of them.
const NON_LATIN = new Set(["ar", "bn", "hi", "ja", "kn", "ko", "ml", "ru", "ta", "te", "ur"]);
const ENGLISH_WORD =
  /\b(of|the|and|or|to|in|for|with|from|is|are|your|you|please|this|that)\b/gi;
// Placeholders, markup, URLs and addresses carry English by design.
const prose = (s) =>
  s.replace(/\{\{[^}]*\}\}/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\w.+-]+@[\w.-]+/g, " ");

const problems = [];
const add = (kind, where, detail) => problems.push({ kind, where, detail });

for (const file of files) {
  const enRaw = readFileSync(`${DIR}/en/${file}`, "utf8");
  const en = flat(JSON.parse(enRaw.replace(/^﻿/, "")));
  const enDomains = new Set(Object.values(en).filter((v) => typeof v === "string").flatMap(domains));

  for (const locale of [...others, "en"]) {
    const path = `${DIR}/${locale}/${file}`;
    let raw;
    try { raw = readFileSync(path, "utf8"); } catch { continue; }
    const where = `${locale}/${file}`;

    if (raw.charCodeAt(0) === 0xfeff) add("encoding", where, "starts with a byte-order mark");
    if (raw.includes("�")) add("encoding", where, "contains a replacement character");
    for (const m of MOJIBAKE) {
      if (raw.includes(m)) { add("encoding", where, "contains Latin-1 mojibake"); break; }
    }
    if (/\bLetshyre\b/.test(raw)) add("brand", where, 'uses "Letshyre" — the brand is "LetsHyre"');

    const data = flat(JSON.parse(raw.replace(/^﻿/, "")));
    if (locale === "en") continue;

    for (const [key, enValue] of Object.entries(en)) {
      const value = data[key];

      if (key.endsWith("#len")) {
        if (value !== enValue) add("array", where, `${key.slice(0, -4)}: ${value} items, English has ${enValue}`);
        continue;
      }
      if (typeof enValue !== "string" || typeof value !== "string") continue;

      const enTags = tags(enValue).join(",");
      if (enTags !== tags(value).join(",")) {
        add("markup", where, `${key}: tags [${tags(value)}] don't match English [${tags(enValue)}]`);
      }

      const enVars = vars(enValue), locVars = vars(value);
      const extra = locVars.filter((v) => !enVars.includes(v));
      if (extra.length) add("interpolation", where, `${key}: has ${extra.join(" ")}, which English doesn't`);
      const missing = enVars.filter((v) => !locVars.includes(v));
      // A plural form may spell the number out: "1 day ago", "yesterday".
      if (missing.length && !PLURAL_SUFFIX.test(key)) {
        add("interpolation", where, `${key}: missing ${missing.join(" ")}`);
      }

      for (const d of domains(value)) {
        if (!enDomains.has(d)) add("domain", where, `${key}: uses ${d}, which English doesn't`);
      }

      if (value === enValue && !isStructural(key) && !SHARED_WITH_EN.has(enValue.trim()) &&
          /\s/.test(enValue.trim()) && translatableWords(enValue).length > 1) {
        add("leftover", where, `${key}: identical to English — ${JSON.stringify(enValue.slice(0, 60))}`);
      }

      if (NON_LATIN.has(locale) && !isStructural(key)) {
        const found = prose(value).match(ENGLISH_WORD);
        if (found) {
          add("english", where, `${key}: leaves "${[...new Set(found)].join('", "')}" untranslated — ${JSON.stringify(value.slice(0, 60))}`);
        }
      }
    }
  }
}

for (const [term, entry] of Object.entries(GLOSSARY)) {
  for (const [locale, rule] of Object.entries(entry.locales)) {
    if (rule.status !== "enforced" || !rule.avoid?.length) continue;
    const skip = new Set(rule.except || []);
    for (const file of files) {
      if (skip.has(file)) continue;
      let raw;
      try { raw = readFileSync(`${DIR}/${locale}/${file}`, "utf8"); } catch { continue; }
      for (const bad of rule.avoid) {
        if (raw.includes(bad)) {
          add("glossary", `${locale}/${file}`, `"${term}" should be "${rule.use}", found "${bad}"`);
        }
      }
    }
  }
}

if (problems.length) {
  const byKind = {};
  for (const p of problems) (byKind[p.kind] ??= []).push(p);
  for (const [kind, items] of Object.entries(byKind)) {
    console.error(`\nFAIL  ${kind} (${items.length})`);
    for (const i of items.slice(0, 20)) console.error(`  ${i.where}  ${i.detail}`);
    if (items.length > 20) console.error(`  ...and ${items.length - 20} more`);
  }
  process.exit(1);
}

console.log(`i18n quality OK — ${others.length} locales checked across ${files.length} namespaces`);
