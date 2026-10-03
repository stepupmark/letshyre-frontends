// Central SEO helper for the public, prerendered pages. Everything a route's
// meta() needs — title, description, canonical, hreflang, Open Graph, Twitter,
// JSON-LD — is built from one small per-page object so the pages can't drift
// apart. Kept free of any i18n-runtime import (only pure config helpers) so the
// Node sitemap script can import it too. That import stays relative for the
// same reason: the scripts run without Vite, so the @/ alias is unresolvable.
import {
  DEFAULT_LOCALE,
  OG_LOCALE,
  PRERENDER_LOCALES,
  localePath,
  localesForPage,
} from "../i18n/config.js";

// Read isomorphically: Vite statically replaces `import.meta.env.VITE_*` in
// both the browser bundle and the prerender pass, but the sitemap/verify-seo
// scripts run as plain Node and only see `process.env`.
const envSiteUrl =
  globalThis.process?.env?.VITE_SITE_URL ||
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SITE_URL);

export const SITE = {
  url: envSiteUrl || "https://letshyre.ai",
  name: "LetsHyre",
  twitter: "@letshyreAi",
  get defaultOg() {
    return `${this.url}/og/default.jpg`;
  },
  locale: "en_US",
};

// Pages with their own card in public/og/, keyed by locale-relative suffix.
const OG_PAGES = new Set([
  "",
  "/about",
  "/contact",
  "/download",
  "/how-it-works-interview",
  "/pricing",
  "/terms",
  "/policy",
  "/refund-policy",
]);

export const ogImage = (path) =>
  OG_PAGES.has(path) ? `${SITE.url}/og/${path.slice(1) || "home"}.jpg` : SITE.defaultOg;

// Absolute URL for a site-relative path ("/about" -> "https://letshyre.ai/about").
export const absUrl = (path = "/") =>
  `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

// Site-wide Organization node — reused across pages and referenced by @id.
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo2.webp`,
  sameAs: [
    "https://www.linkedin.com/company/letshyre/",
    "https://x.com/letshyreAi",
    "https://www.instagram.com/letshyreofficial/",
    "https://www.youtube.com/@LetsHyre",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@letshyre.ai",
    url: `${SITE.url}/contact`,
    availableLanguage: PRERENDER_LOCALES,
  },
};

// Site-wide WebSite node.
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  publisher: { "@id": `${SITE.url}/#organization` },
};

// BreadcrumbList from an ordered [{ name, path }] trail (paths are locale-
// relative suffixes). The locale Home is prepended.
export const breadcrumbSchema = (lang, homeName, trail = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: homeName, path: "" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absUrl(localePath(lang, crumb.path)),
  })),
});

// A WebPage/AboutPage/ContactPage node tied to the site graph. `path` is the
// locale-relative suffix ("" | "/about"); the node is localized per language.
export const webPageSchema = ({ type = "WebPage", lang, path, name, description, dateModified }) => ({
  "@context": "https://schema.org",
  "@type": type,
  "@id": `${absUrl(localePath(lang, path))}#webpage`,
  url: absUrl(localePath(lang, path)),
  name,
  description,
  isPartOf: { "@id": `${SITE.url}/#website` },
  publisher: { "@id": `${SITE.url}/#organization` },
  inLanguage: lang,
  ...(dateModified ? { dateModified } : {}),
});

/**
 * Builds the full React Router meta() array from a small per-page object.
 *
 * @param {object}  o
 * @param {string}  o.lang          Current locale, from params.lang.
 * @param {string}  o.path          Locale-relative suffix ("" | "/about").
 * @param {string}  o.title         ≤ 60 chars.
 * @param {string}  o.description   140–160 chars.
 * @param {string} [o.image]        Absolute OG image URL; defaults to the branded one.
 * @param {string} [o.type]         Open Graph type. Default "website".
 * @param {string} [o.robots]       Default "index, follow".
 * @param {object[]} [o.jsonLd]     Page-specific JSON-LD. The Organization and
 *                                  WebSite nodes are always prepended.
 */
export function buildMeta({
  lang,
  path,
  title,
  description,
  image,
  type = "website",
  robots = "index, follow",
  jsonLd = [],
}) {
  const url = absUrl(localePath(lang, path));
  const img = image || ogImage(path);

  // hreflang set: every locale that ships this page, plus x-default -> default.
  const pageLocales = localesForPage(path);
  const alternates = [
    ...pageLocales.map((loc) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: loc,
      href: absUrl(localePath(loc, path)),
    })),
    {
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: absUrl(localePath(DEFAULT_LOCALE, path)),
    },
  ];

  const ogAltLocales = pageLocales
    .filter((loc) => loc !== lang)
    .map((loc) => ({ property: "og:locale:alternate", content: OG_LOCALE[loc] }));

  return [
    { title },
    { name: "description", content: description },
    {
      name: "robots",
      content: `${robots}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`,
    },
    { tagName: "link", rel: "canonical", href: url },
    ...alternates,

    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE.name },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:width", content: "1024" },
    { property: "og:image:height", content: "535" },
    { property: "og:image:alt", content: `${SITE.name} — ${title}` },
    { property: "og:locale", content: OG_LOCALE[lang] || SITE.locale },
    ...ogAltLocales,

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE.twitter },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
    { name: "twitter:image:alt", content: `${SITE.name} — ${title}` },

    // Every page repeats these two: webPageSchema's publisher/isPartOf point at
    // them by @id, and a crawler only resolves an @id defined on the same page.
    ...[organizationSchema, websiteSchema, ...jsonLd].map((schema) => ({
      "script:ld+json": schema,
    })),
  ];
}
