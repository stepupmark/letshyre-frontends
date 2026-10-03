import { localeLoaders } from "./messages";
import { getI18n } from "./i18n";

const fileMaps = new Map();
const loaded = new Set();

function fileMap(lang) {
  const load = localeLoaders[`./${lang}/index.js`];
  if (!load) return Promise.resolve({});
  if (!fileMaps.has(lang)) {
    const pending = load().then((mod) => mod.default);
    pending.catch(() => fileMaps.delete(lang));
    fileMaps.set(lang, pending);
  }
  return fileMaps.get(lang);
}

export async function loadCatalogs(lang, namespaces) {
  const missing = namespaces.filter((ns) => !loaded.has(`${lang}:${ns}`));
  if (!missing.length) return;

  const files = await fileMap(lang);
  await Promise.all(
    missing.map(async (ns) => {
      const load = files[`./${ns}.json`];
      if (!load) return;
      getI18n(lang).addResourceBundle(lang, ns, await load(), true, false);
      loaded.add(`${lang}:${ns}`);
    }),
  );
}

export const loadedNamespaces = (lang) =>
  [...loaded].filter((key) => key.startsWith(`${lang}:`)).map((key) => key.slice(lang.length + 1));

export const routeNamespaces = (routes) => [
  ...new Set(routes.flatMap((route) => route?.handle?.i18n ?? [])),
];
