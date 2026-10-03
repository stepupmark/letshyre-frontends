// Fails the build if code asks for a key no catalog defines. Parity compares
// catalogs to each other, so a key that is missing everywhere — a typo, or one
// renamed in the JSON but not the JSX — passes it and renders the raw key
// string to the user. This checks the other direction: code against English.
//
// Only literal keys are checked. A computed key (`t(`a.${b}`)`) is skipped
// rather than guessed at, so this never fails on something it can't resolve.

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const MESSAGES = "app/i18n/messages/en";
const SRC = "app";
const PLURAL = ["_zero", "_one", "_two", "_few", "_many", "_other"];
const DEFAULT_NS = "common";

const catalogs = new Map();
for (const file of readdirSync(MESSAGES).filter((f) => f.endsWith(".json"))) {
  catalogs.set(file.replace(/\.json$/, ""), JSON.parse(readFileSync(join(MESSAGES, file), "utf8")));
}

const resolve = (ns, key) => {
  let node = catalogs.get(ns);
  if (!node) return false;
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return false;
    node = node[part];
  }
  return node !== undefined;
};

const exists = (ns, key) =>
  resolve(ns, key) || PLURAL.some((suffix) => resolve(ns, key + suffix));

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.jsx?$/.test(entry)) out.push(path);
  }
  return out;
}

// `const { t } = useTranslation("employer")`, `const { t: tJobs } = ...`,
// and the getFixedT wrappers the SEO routes use.
const BINDING =
  /\{\s*t(?:\s*:\s*(\w+))?\s*[,}][^=]*=\s*(?:useTranslation|nsT|getFixedT)\(([^)]*)\)/g;
const SEO_BINDING = /const\s+(\w+)\s*=\s*seoT\(/g;
const NS_BINDING = /const\s+(\w+)\s*=\s*nsT\([^,]+,\s*"(\w+)"\)/g;

const problems = [];

for (const file of walk(SRC)) {
  const src = readFileSync(file, "utf8");

  const bindings = new Map();
  const bind = (name, ns) => {
    if (!bindings.has(name)) bindings.set(name, new Set());
    bindings.get(name).add(ns);
  };

  for (const [, alias, args] of src.matchAll(BINDING)) {
    const namespaces = [...args.matchAll(/["'`]([\w-]+)["'`]/g)]
      .map((m) => m[1])
      .filter((n) => catalogs.has(n));
    // `useTranslation()` means the default namespace; `useTranslation(ns)` with
    // a variable is unresolvable, so leave that binding unchecked.
    if (!namespaces.length && args.trim()) continue;
    for (const ns of namespaces.length ? namespaces : [DEFAULT_NS]) bind(alias || "t", ns);
  }
  for (const [, name] of src.matchAll(SEO_BINDING)) bind(name, "seo");
  for (const [, name, ns] of src.matchAll(NS_BINDING)) bind(name, ns);

  if (!bindings.size) continue;

  for (const [name, namespaces] of bindings) {
    const call = new RegExp(`\\b${name}\\(\\s*"([^"$]+)"`, "g");
    for (const [, raw] of src.matchAll(call)) {
      // An explicit "ns:key" prefix overrides whatever the binding carries.
      const [ns, key] = raw.includes(":") ? raw.split(":") : [null, raw];
      const search = ns ? [ns] : [...namespaces];
      if (search.some((n) => exists(n, key))) continue;
      problems.push(`${file}  ${name}("${raw}") — not in ${search.join(", ")}`);
    }
  }
}

if (problems.length) {
  console.error(`\nFAIL  ${problems.length} translation key(s) used in code but missing from English`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`i18n usage OK — every literal t() key resolves against ${catalogs.size} en namespaces`);
