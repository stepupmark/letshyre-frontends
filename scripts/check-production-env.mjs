#!/usr/bin/env node
// Fails the build before it starts when the environment is missing or half set.
// A build without VITE_ENV=production ships a Disallow-all robots.txt and no
// Meta Pixel, and nothing else would flag it.
import "./lib/env.mjs";

const ENVS = ["production", "staging", "development"];
const { VITE_ENV, VITE_SITE_URL, VITE_META_PIXEL_ID } = process.env;

const errors = [];
if (!ENVS.includes(VITE_ENV)) {
  errors.push(`VITE_ENV must be one of ${ENVS.join(", ")} (got "${VITE_ENV ?? ""}")`);
} else if (VITE_ENV === "production") {
  if (!VITE_SITE_URL) errors.push("VITE_SITE_URL is required for a production build");
  if (!VITE_META_PIXEL_ID) errors.push("VITE_META_PIXEL_ID is required for a production build");
}

if (errors.length) {
  for (const error of errors) console.error(`check-production-env: ${error}`);
  console.error("Set these in .env.production on the server (see .env.example).");
  process.exit(1);
}
console.log(`check-production-env: building for ${VITE_ENV}`);
