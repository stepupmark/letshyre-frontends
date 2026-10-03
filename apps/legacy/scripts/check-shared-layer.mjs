// Fails the build when a module in the shared layer — app/components, app/hooks,
// app/lib, app/services — is used by fewer than two features. The app is built
// as vertical slices: a feature owns its screens, hooks, services, schemas and
// helpers, and the shared layer exists only for what two or more features
// genuinely have in common. Left ungated the shared layer becomes the default
// dumping ground, which is what happened three times before; ownership then
// stops being readable from the folder and nothing can be deleted with
// confidence. check-feature-boundaries covers the other half of the rule — one
// feature reaching into another.
//
// Counting is by reachability, not by direct import, for two reasons.
//
// A module reached only from app/routes/**, app/root.jsx, app/loaders/** or
// app/i18n/** is route-level infrastructure and passes: route wiring belongs to
// no feature, so there is no feature to move it into. Demanding two features of
// app/lib/seo.js would make the gate noise.
//
// A module reached only from another shared module inherits that module's
// consumers rather than being counted as unused. app/lib/apiErrorMessages.js has
// one direct feature consumer but app/lib/authErrorMessages.js is built on its
// createErrorResolver, so both roles depend on it and it is correctly shared.
// Inheriting keeps the chain honest in the other direction too: a straggler that
// only a second straggler imports still fails, instead of the pair excusing each
// other.
//
// Three features are themselves a shared tier — common, candidate-profile and
// scorecard hold what both roles render, and check-feature-boundaries lets any
// feature import them. A module they use is used by both roles, so they
// propagate their own consumers rather than counting as one feature.
//
// Import specifiers are resolved to real files rather than matched as text, so
// "@/lib/utils" cannot be confused with "@/lib/utilsSomething".
//
// Out of scope: app/components/ui/** (vendored shadcn, re-synced from upstream)
// and *.test.js(x) — a test is not a consumer, or every module a test file
// touches would look shared.

import { existsSync, readdirSync, readFileSync, statSync } from "fs";

const SHARED_ROOTS = ["app/components", "app/hooks", "app/lib", "app/services"];
const FEATURES_ROOT = "app/features";
// Keep in step with SHARED in check-feature-boundaries.mjs.
const SHARED_FEATURES = ["common", "candidate-profile", "scorecard"];
const SKIP = ["app/components/ui/", "app/assets/", "app/test/"];

// Deliberate exceptions, each needing the reason it is not a straggler. Empty:
// nothing in the shared layer today needs one, and an entry is a decision to
// leave a single-owner module where it is, not a way to silence the check.
// Format: "app/path/to/module.js".
const ALLOWLIST = new Set([]);

const IMPORT = /from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']/g;

const INFRASTRUCTURE = Symbol("infrastructure");

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const inScope = (path) =>
  /\.jsx?$/.test(path) && !/\.test\.jsx?$/.test(path) && !SKIP.some((s) => path.startsWith(s));

const files = walk("app").filter(inScope);
const isShared = (path) => SHARED_ROOTS.some((root) => path.startsWith(`${root}/`));
const isSharedFeature = (path) =>
  SHARED_FEATURES.some((name) => path.startsWith(`${FEATURES_ROOT}/${name}/`));
const shared = files.filter(isShared);

const resolve = (specifier, from) => {
  let base;
  if (specifier.startsWith("@/")) base = `app/${specifier.slice(2)}`;
  else if (specifier.startsWith(".")) base = new URL(specifier, `file:///${from}`).pathname.slice(1);
  else return null;

  for (const candidate of [base, `${base}.js`, `${base}.jsx`, `${base}/index.js`, `${base}/index.jsx`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
};

// Only edges that land in the shared layer matter; everything else is either a
// feature's own business or a package.
const edges = new Map(
  files.map((file) => {
    const source = readFileSync(file, "utf8");
    const targets = new Set();
    for (const match of source.matchAll(IMPORT)) {
      const target = resolve(match[1] ?? match[2], file);
      if (target && target !== file && (isShared(target) || isSharedFeature(target))) {
        targets.add(target);
      }
    }
    return [file, [...targets]];
  }),
);

const consumers = new Map(shared.map((file) => [file, new Set()]));

// Walking on from each shared module is what lets a consumer count through a
// chain of shared modules.
const spread = (from, label) => {
  const queue = [...(edges.get(from) ?? [])];
  const seen = new Set(queue);
  while (queue.length) {
    const module = queue.pop();
    consumers.get(module)?.add(label);
    for (const next of edges.get(module) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
};

for (const file of files) {
  if (isShared(file) || isSharedFeature(file)) continue;
  spread(
    file,
    file.startsWith(`${FEATURES_ROOT}/`)
      ? file.slice(FEATURES_ROOT.length + 1).split("/")[0]
      : INFRASTRUCTURE,
  );
}

const stale = [...ALLOWLIST];
const offenders = [];

for (const [module, labels] of consumers) {
  if (labels.has(INFRASTRUCTURE)) continue;
  if (labels.size >= 2) continue;

  if (ALLOWLIST.has(module)) {
    stale.splice(stale.indexOf(module), 1);
    continue;
  }
  const owners = [...labels];
  offenders.push(`${module}  ${owners.length ? `only ${owners[0]}` : "no feature uses it"}`);
}

if (offenders.length) {
  console.error(
    "FAIL  shared-layer modules used by fewer than two features (move each into the feature that owns it):",
  );
  for (const offender of offenders.sort()) console.error(`  ${offender}`);
  process.exit(1);
}

// A stale entry means the module moved or earned a second consumer; left in
// place it would silently excuse whatever takes that path next.
if (stale.length) {
  console.error("FAIL  stale ALLOWLIST entries — remove or re-point them:");
  for (const entry of stale) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(
  `shared-layer OK — ${shared.length} modules, each used by two or more features or by route-level infrastructure`,
);
