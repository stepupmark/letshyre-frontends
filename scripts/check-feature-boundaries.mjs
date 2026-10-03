// Fails the build when one feature imports another's internals. Co-locating a
// feature only pays off if the folder tells the truth about ownership: a module
// two features reach into belongs in a shared layer, not inside one of them.
//
// SHARED lists the features any other feature may import: common holds
// cross-role screens (the chatbot), candidate-profile and scorecard hold the
// presentation both roles render. Adding to it is a design decision, not a
// way to silence the check.
//
// Shared building blocks stay where they were: app/components, app/hooks,
// app/lib, app/services. Only feature-to-feature edges are in scope.

import { readdirSync, readFileSync, statSync } from "fs";

const ROOT = "app/features";
const SHARED = new Set(["common", "candidate-profile", "scorecard"]);

const ALLOWLIST = new Set([]);

const IMPORT = /(?:from|import)\s*\(?\s*["']@\/features\/([^/"']+)/;

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.jsx?$/.test(entry)) files.push(path);
  }
};
walk(ROOT);

const stale = [...ALLOWLIST];
const offenders = [];

for (const file of files) {
  const owner = file.slice(ROOT.length + 1).split("/")[0];
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      const target = line.match(IMPORT)?.[1];
      if (!target || target === owner || SHARED.has(target)) return;

      const key = `${file}:${i + 1}`;
      if (ALLOWLIST.has(key)) {
        stale.splice(stale.indexOf(key), 1);
        return;
      }
      offenders.push(`${key}  ${owner} -> ${target}`);
    });
}

if (offenders.length) {
  console.error(
    "FAIL  feature imports another feature's internals (move the shared part out, or into app/features/common):",
  );
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}

// An allowlist entry that no longer matches means the line moved or the import
// went away; left in place it would silently excuse the next one on that line.
if (stale.length) {
  console.error("FAIL  stale ALLOWLIST entries — remove or re-point them:");
  for (const entry of stale) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(`feature-boundaries OK — ${files.length} files, no cross-feature imports`);
