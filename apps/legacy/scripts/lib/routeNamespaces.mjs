import { existsSync, readFileSync } from "fs";

export const HANDLE = /export const handle = \{ i18n: \[([^\]]*)\] \};/;

// The namespaces a route file declares in `handle.i18n`. Route ids are the
// ones React Router uses, e.g. "routes/_publicLang.$lang.terms".
export function routeNamespaces(routeId) {
  const file = `app/${routeId}.jsx`;
  if (!existsSync(file)) return [];
  const match = readFileSync(file, "utf8").match(HANDLE);
  return match ? [...match[1].matchAll(/"(\w+)"/g)].map((m) => m[1]) : [];
}
