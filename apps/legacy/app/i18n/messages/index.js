// Prerender needs every catalog up front because getI18n() is synchronous.
// The browser loads a locale's file map first, then only the files it needs.
const ssrModules = import.meta.env.SSR
  ? import.meta.glob("./*/*.json", { eager: true })
  : {};

export const localeLoaders = import.meta.env.SSR ? {} : import.meta.glob("./*/index.js");

export const resources = {};
const nsSet = new Set();

for (const [path, mod] of Object.entries(ssrModules)) {
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, locale, ns] = match;
  (resources[locale] ??= {})[ns] = mod.default ?? mod;
  nsSet.add(ns);
}

export const namespaces = [...nsSet];
