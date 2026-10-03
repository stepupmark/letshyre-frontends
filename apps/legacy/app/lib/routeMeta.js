import { seoT } from "@/i18n/i18n";
import { preferredLocale } from "@/i18n/hooks";
import { isLocale } from "@/i18n/config";

// meta() runs before any component, so it can't use useLocale(). Mirror the rule
// entry.client.jsx applies: the /:lang segment when there is one, else the
// stored locale. That is what decided which catalogs were fetched, and reading
// a different locale here yields raw keys in <title>.
const metaLocale = () => {
  const seg =
    typeof location === "undefined" ? "" : location.pathname.split("/")[1];
  return isLocale(seg) ? seg : preferredLocale();
};

// Meta for the client-rendered pages that have no /:lang segment and so no
// prerendered HTML — auth, the 404, and the whole /employee and /employer
// trees. They get a title for the tab and a noindex directive; robots.txt
// must not block them, or the directive is never fetched and the URL can
// still be listed.
export const noindexMeta = (key) => () => {
  const t = seoT(metaLocale());
  return [
    { title: t(`${key}.title`) },
    { name: "description", content: t(`${key}.description`) },
    { name: "robots", content: "noindex, follow" },
  ];
};

// Same as noindexMeta, but for a route whose title/description depend on its
// own loader data (e.g. a specific job's name) rather than a fixed string.
// `values(loaderData, t)` builds the interpolation object passed to both
// strings.
export const noindexDataMeta = (key, values) => ({ loaderData }) => {
  const t = seoT(metaLocale());
  const vars = values ? values(loaderData, t) : undefined;
  return [
    { title: t(`${key}.title`, vars) },
    { name: "description", content: t(`${key}.description`, vars) },
    { name: "robots", content: "noindex, follow" },
  ];
};

// /:lang matches any single segment, so a stray path like /nonsense reaches
// these routes with a locale that has no catalogs. Building page meta from it
// yields raw keys at best and throws at worst, so serve the 404 meta instead.
export const localeMeta = (build) => ({ params }) =>
  isLocale(params.lang) ? build(params.lang) : noindexMeta("notFound")();
