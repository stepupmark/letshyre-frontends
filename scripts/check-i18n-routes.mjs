// Fails the build when a route renders copy from a namespace that neither it
// nor its parent layouts load. Pages only get the catalogs listed in their
// `handle.i18n`, so a missing one shows raw keys, or crashes where the copy is
// an array, and only for visitors who reach the page by a particular path.
//
// It follows static imports from each route file and collects the namespaces
// used along the way. Dynamic imports are skipped: lazy code loads its own.

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import { HANDLE, routeNamespaces } from "./lib/routeNamespaces.mjs";

const APP = "app";
const ROUTES = "app/routes";

const catalogs = new Set(
  readdirSync("app/i18n/messages/en").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)),
);

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(APP, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  for (const ext of ["", ".jsx", ".js", "/index.jsx", "/index.js"]) {
    const file = base + ext;
    if (existsSync(file) && statSync(file).isFile()) return relative(".", file);
  }
  return null;
}

const scanned = new Map();
function scan(file) {
  if (scanned.has(file)) return scanned.get(file);
  const src = readFileSync(file, "utf8").replace(/import\(\s*["'][^"']+["']\s*\)/g, "");
  const deps = [...src.matchAll(/\bfrom\s*["']([^"']+)["']|^import\s*["']([^"']+)["']/gm)]
    .map((m) => resolveImport(file, m[1] ?? m[2]))
    .filter(Boolean);

  const namespaces = new Set();
  for (const [, args] of src.matchAll(/\buseTranslation\(([^)]*)\)/g)) {
    const named = [...args.matchAll(/["'](\w+)["']/g)].map((m) => m[1]);
    for (const ns of named.length ? named : ["common"]) namespaces.add(ns);
  }
  for (const [, ns] of src.matchAll(/\bnsT\([^,]+,\s*["'](\w+)["']/g)) namespaces.add(ns);
  if (/\bseoT\(/.test(src)) namespaces.add("seo");

  const info = { deps, namespaces };
  scanned.set(file, info);
  return info;
}

// Namespace -> the file that uses it, so a failure points at the culprit.
function needed(file, seen = new Map(), visited = new Set()) {
  if (visited.has(file) || file.includes("i18n") || /\.test\./.test(file)) return seen;
  visited.add(file);
  const { deps, namespaces } = scan(file);
  for (const ns of namespaces) if (!seen.has(ns)) seen.set(ns, file);
  for (const dep of deps) needed(dep, seen, visited);
  return seen;
}

const ids = readdirSync(ROUTES)
  .filter((f) => f.endsWith(".jsx"))
  .map((f) => f.slice(0, -4));

// Flat routes: a file nests under the longest dotted prefix that is also a
// route file, unless a trailing "_" on a segment opts it out.
function ancestors(id) {
  const parts = id.split(".");
  const out = ["root"];
  for (let i = parts.length - 1; i > 0; i--) {
    if (parts[i - 1].endsWith("_")) break;
    const prefix = parts.slice(0, i).join(".");
    if (ids.includes(prefix)) out.push(`routes/${prefix}`);
  }
  return out;
}

const problems = [];
const entries = [
  { id: "root", file: "app/root.jsx", parents: [] },
  ...ids.map((id) => ({ id: `routes/${id}`, file: join(ROUTES, `${id}.jsx`), parents: ancestors(id) })),
];

for (const { id, file, parents } of entries) {
  const src = readFileSync(file, "utf8");
  if (/catalogLoader\(/.test(src) && !HANDLE.test(src)) {
    problems.push(`${id}: calls catalogLoader without a literal \`export const handle = { i18n: [...] };\``);
    continue;
  }

  const provided = new Set([id, ...parents].flatMap(routeNamespaces));
  for (const [ns, source] of needed(file)) {
    if (!catalogs.has(ns)) problems.push(`${id}: "${ns}" has no catalog (used in ${source})`);
    else if (!provided.has(ns)) problems.push(`${id}: "${ns}" is used in ${source} but not loaded by the route or its layouts`);
  }
}

if (problems.length) {
  console.error("check-i18n-routes: namespaces missing from route handles:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`i18n routes OK — ${entries.length} routes load every namespace they render`);
