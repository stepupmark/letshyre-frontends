// Fails the build if a physical directional Tailwind utility (ml-*, pr-*,
// border-l-*, text-right, etc.) appears anywhere under app/features or
// app/components. Physical utilities don't flip for RTL locales (ar, ur; see
// app/i18n/config.js's RTL_LOCALES), so they render mirrored/misaligned.
//
// This used to check a hand-maintained AUDITED_FILES list, because a full-tree
// scan would have failed on pre-existing debt in files not yet swept. That debt
// is gone, so the scan now walks the tree and new files are covered without
// anyone remembering to add them.
//
// app/components/ui/** stays out of scope — shadcn/ui vendor-style primitives,
// re-synced from upstream rather than edited in place.

import { readFileSync, readdirSync, statSync } from "fs";

const ROOTS = ["app/features", "app/components"];
const SKIP = ["app/components/ui/"];

const PATTERN =
  /\b(ml|mr|pl|pr)-[0-9]+(\.[0-9]+)?\b|-m[lr]-[0-9]+(\.[0-9]+)?\b|border-[lr](-[a-zA-Z0-9[\]/#.,%()-]+)?\b|rounded-[lr](-[a-zA-Z0-9]+)?\b|text-(left|right)\b|(^|[^-\w])(left|right)-[0-9]+(\.[0-9]+)?(\/[0-9]+)?\b/;

// Deliberate exceptions found during the RTL sweep: centering transforms
// (left-1/2 paired with -translate-x-1/2) and full-bleed decorative background
// washes, none of which are text-flow layout.
// Format: "path/relative/to/repo-root.jsx:<line>".
const ALLOWLIST = new Set([
  "app/features/legal/components/PolicyLayout.jsx:330",
  "app/features/employee/not-found/EmployeeErrorBoundary.jsx:61",
  "app/features/employer/not-found/EmployerErrorBoundary.jsx:58",
  "app/features/not-found/NotFound.jsx:16",
  "app/features/legal/components/Tooltip.jsx:8",
  "app/features/home/components/VideoSection.jsx:36",
  "app/features/home/components/Hero.jsx:145",
  "app/features/home/components/ScoreCard.jsx:15",
  "app/components/layout/Navbar.jsx:123",
  "app/features/home/components/Assistance.jsx:164",

  // ProfileSkeleton/ProfileBanner: fixed-width center well sized against two
  // physically-positioned (unmirrored) side images, and the side-image
  // containers/imgs themselves — see the comments in each file.
  "app/features/employer/components/profile/ProfileSkeleton.jsx:24",
  "app/features/employer/components/profile/ProfileBanner.jsx:13",
  "app/features/employer/components/profile/ProfileBanner.jsx:19",
  "app/features/employer/components/profile/ProfileBanner.jsx:27",
  "app/features/employer/components/profile/ProfileBanner.jsx:67",
]);

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const files = ROOTS.flatMap(walk).filter(
  (f) => f.endsWith(".jsx") && !SKIP.some((s) => f.startsWith(s)),
);

const offenders = [];
const stale = [...ALLOWLIST];

for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (!PATTERN.test(line)) return;
      const key = `${file}:${i + 1}`;
      if (ALLOWLIST.has(key)) {
        stale.splice(stale.indexOf(key), 1);
        return;
      }
      offenders.push(key);
    });
}

if (offenders.length) {
  console.error(
    "FAIL  physical directional utilities found (use logical ms-/me-/ps-/pe-/border-s-/border-e-/rounded-s-/rounded-e-/text-start/text-end/start-/end- instead):",
  );
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}

// An allowlist entry that no longer matches means the line moved or was fixed;
// left in place it would silently excuse whatever ends up on that line next.
if (stale.length) {
  console.error("FAIL  stale ALLOWLIST entries — remove or re-point them:");
  for (const entry of stale) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(`rtl-classes OK — ${files.length} files clean of physical directional utilities`);
