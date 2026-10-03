// Fails the build if any locale is missing a key that exists in English —
// the source of the "raw i18n key shown in the UI" bug class. Plural-suffixed
// keys (_zero/_one/_two/_few/_many/_other) are compared by their base name
// since locales legitimately carry different plural forms than English.

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { namespaceLocales } from "../app/i18n/config.js";

const messagesDir = "app/i18n/messages";
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(obj, prefix = "", out = new Set()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out.add(path.replace(PLURAL_SUFFIX, ""));
    }
  }
  return out;
}

function loadKeys(path) {
  const raw = readFileSync(path, "utf8");
  const body = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return flatten(JSON.parse(body));
}

const locales = readdirSync(messagesDir).filter(
  (d) => d !== "en" && statSync(join(messagesDir, d)).isDirectory(),
);
const enFiles = readdirSync(join(messagesDir, "en")).filter((f) => f.endsWith(".json"));

let failed = false;
for (const locale of locales) {
  for (const file of enFiles) {
    if (!namespaceLocales(file.replace(/\.json$/, "")).includes(locale)) continue;
    const enPath = join(messagesDir, "en", file);
    const localePath = join(messagesDir, locale, file);

    let localeKeys;
    try {
      localeKeys = loadKeys(localePath);
    } catch {
      console.error(`FAIL  ${locale}/${file}  file missing`);
      failed = true;
      continue;
    }

    const enKeys = loadKeys(enPath);
    const missing = [...enKeys].filter((k) => !localeKeys.has(k));
    if (missing.length) {
      console.error(`FAIL  ${locale}/${file}  missing ${missing.length} key(s): ${missing.join(", ")}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`i18n parity OK — ${locales.length} locales checked against ${enFiles.length} en namespaces`);
