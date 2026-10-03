// Fails the build if a file or directory drifts from the layout conventions.
// These had gone three ways at once — schemas were split across
// `<name>.schema.js`, `<name>Schema.js` and `<name>-schema.js`; directories
// mixed camelCase with kebab-case — which makes a file hard to guess at and
// hard to grep for.
//
// Out of scope: app/routes/** (React Router's flat-route filenames own their
// own grammar), app/components/ui/** (vendored shadcn, re-synced from
// upstream), and app/i18n/messages/** (locale catalogs).

import { readdirSync, statSync } from "fs";

const SKIP = [
  "app/routes",
  "app/components/ui",
  "app/i18n/messages",
  "app/assets",
  "app/test",
];

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PASCAL = /^[A-Z][A-Za-z0-9]*$/;

// React Router looks these up by exact filename.
const FRAMEWORK_FILES = new Set(["root.jsx", "entry.client.jsx", "entry.server.jsx"]);

const RULES = [
  // Schemas, services and hooks now live beside the feature that owns them,
  // so each rule matches its directory anywhere under app rather than a
  // single shared root.
  {
    matches: (path) => /(^|\/)schemas\//.test(path),
    test: (name) => /^[a-z][A-Za-z0-9]*\.schema(\.test)?\.js$/.test(name),
    expected: "<domain>.schema.js",
  },
  {
    matches: (path) => /(^|\/)services\//.test(path),
    test: (name) =>
      /^api(\.test)?\.js$/.test(name) ||
      /^[a-z][A-Za-z0-9]*\.service(\.test)?\.js$/.test(name),
    expected: "<domain>.service.js",
  },
  {
    matches: (path) => /(^|\/)store\//.test(path),
    test: (name) => /^[a-z][A-Za-z0-9]*\.store(\.test)?\.js$/.test(name),
    expected: "<domain>.store.js",
  },
  {
    matches: (path) => /(^|\/)queries\//.test(path),
    test: (name) => /^[a-z][A-Za-z0-9]*\.queries(\.test)?\.js$/.test(name),
    expected: "<domain>.queries.js",
  },
  {
    matches: (path) => /(^|\/)mutations\//.test(path),
    test: (name) => /^[a-z][A-Za-z0-9]*\.mutations(\.test)?\.js$/.test(name),
    expected: "<domain>.mutations.js",
  },
  {
    matches: (path) => /(^|\/)hooks\//.test(path),
    test: (name) => /^use[A-Z][A-Za-z0-9]*(\.test)?\.jsx?$/.test(name),
    expected: "use<Name>.js",
  },
];

const offenders = [];

const walk = (dir) => {
  if (SKIP.includes(dir)) return;
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`;
    if (SKIP.includes(path)) continue;

    if (statSync(path).isDirectory()) {
      if (!KEBAB.test(entry)) {
        offenders.push(`${path}  directory should be kebab-case`);
      }
      walk(path);
      continue;
    }

    // .gitkeep and friends hold an empty folder in place; they aren't code.
    if (entry.startsWith(".")) continue;

    const rule = RULES.find((r) => r.matches(path));
    if (rule) {
      if (!rule.test(entry)) offenders.push(`${path}  should be named ${rule.expected}`);
      continue;
    }

    // Everything else: a .jsx file holds a component, so it carries the
    // component's own name. Plain .js helpers are left alone.
    if (
      entry.endsWith(".jsx") &&
      !FRAMEWORK_FILES.has(entry) &&
      !PASCAL.test(entry.replace(/(\.test)?\.jsx$/, ""))
    ) {
      offenders.push(`${path}  component file should be PascalCase`);
    }
  }
};

walk("app");

if (offenders.length) {
  console.error("FAIL  naming conventions:");
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}

console.log("naming OK");
