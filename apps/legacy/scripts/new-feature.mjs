#!/usr/bin/env node
/*
 * Scaffolds a feature slice under app/features/, plus the i18n catalog stub in
 * every locale.
 *
 * The catalog is the part that gets forgotten and the part that breaks the
 * build: a namespace missing from one of the 19 locales fails
 * check-i18n-parity. Writing 19 files by hand is exactly the chore nobody
 * finishes.
 *
 * The route file is printed rather than written, since which of the three
 * route trees it belongs in is a judgement call.
 *
 *   node scripts/new-feature.mjs <feature-name>
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs";

const FEATURES = "app/features";
const MESSAGES = "app/i18n/messages";

// The same rule check-naming.mjs applies to every directory under app/.
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const name = process.argv[2];

if (!name || name.startsWith("-")) {
  console.error("usage: node scripts/new-feature.mjs <feature-name>");
  console.error("       feature-name is kebab-case, e.g. job-alerts");
  process.exit(1);
}

if (!KEBAB.test(name)) {
  console.error(`new-feature: "${name}" is not kebab-case — check-naming.mjs would fail on it`);
  process.exit(1);
}

const dir = `${FEATURES}/${name}`;
if (existsSync(dir)) {
  console.error(`new-feature: ${dir} already exists`);
  process.exit(1);
}

const pascal = name.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
// Feature folders are kebab-case, namespaces are camelCase (employerJobs,
// sharedScorecard) — same words, different grammar.
const namespace = pascal[0].toLowerCase() + pascal.slice(1);

if (existsSync(`${MESSAGES}/en/${namespace}.json`)) {
  console.error(`new-feature: the "${namespace}" i18n namespace is already taken`);
  process.exit(1);
}

const locales = readdirSync(MESSAGES).filter((entry) =>
  statSync(`${MESSAGES}/${entry}`).isDirectory(),
);

const screen = `import { useTranslation } from "react-i18next";

export function ${pascal}() {
  const { t } = useTranslation("${namespace}");

  return (
    <section className="px-[5%] py-16">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </section>
  );
}
`;

for (const sub of ["components", "hooks", "services", "schemas"]) {
  mkdirSync(`${dir}/${sub}`, { recursive: true });
}
writeFileSync(`${dir}/${pascal}.jsx`, screen);

// One value with no whitespace in it: check-i18n-quality flags a translated
// value that is byte-identical to English, but only once it reads as a
// sentence, so a placeholder like this passes until real copy replaces it.
const stub = `{\n  "title": "${pascal}"\n}\n`;
for (const locale of locales) {
  writeFileSync(`${MESSAGES}/${locale}/${namespace}.json`, stub);
}

console.log(`created  ${dir}/${pascal}.jsx`);
console.log(`created  ${dir}/{components,hooks,services,schemas}/  (empty — git won't track them until you add a file)`);
console.log(`created  ${MESSAGES}/{${locales.join(",")}}/${namespace}.json`);
console.log("");
console.log("Next, by hand:");
console.log("");
console.log("1. Create the route file in app/routes/ — the filename is the URL:");
console.log("");
console.log(`       _publicLang.$lang.${name}.jsx   prerendered marketing/legal page under /:lang`);
console.log(`       _public.${name}.jsx             public page with no locale segment, not prerendered`);
console.log(`       employer.${name}.jsx            behind the employer guard`);
console.log(`       employee.${name}.jsx            behind the employee guard`);
console.log("");
console.log(`       export { ${pascal} as default } from "@/features/${name}/${pascal}";`);
console.log(`       export const handle = { i18n: ["${namespace}"] };`);
console.log("       export const clientLoader = catalogLoader(handle.i18n);");
console.log("");
console.log("   A prerendered page also needs `export const loader = () => null;` beside the");
console.log("   clientLoader, or it ships an empty body. See docs/adding-a-feature.md.");
console.log("");
console.log("2. Replace the stub copy with real translations, then run the gates:");
console.log("");
console.log("       pnpm lint && pnpm test");
console.log("       node scripts/check-naming.mjs");
console.log("       node scripts/check-feature-boundaries.mjs");
console.log("       node scripts/check-rtl-classes.mjs");
console.log("       node scripts/check-i18n-parity.mjs");
console.log("       node scripts/check-i18n-quality.mjs");
console.log("       node scripts/check-i18n-usage.mjs");
console.log("       node scripts/check-i18n-routes.mjs");
