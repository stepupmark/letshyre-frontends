import { DEFAULT_LOCALE, type Locale, localePath } from "@workspace/i18n"

export interface SitemapPage {
  /** Relative to the locale: "" or "/pricing". */
  path: string
  locales: readonly Locale[]
  lastmod: (lang: Locale) => string
}

const xml = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

export function renderSitemap(site: string, pages: SitemapPage[]): string {
  const url = (lang: Locale, path: string) => xml(site + localePath(lang, path))

  const entries = pages.flatMap(({ path, locales, lastmod }) => {
    const alternates = [
      ...locales.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LOCALE, path)}"/>`,
    ]
    return locales.map((lang) =>
      [
        "  <url>",
        `    <loc>${url(lang, path)}</loc>`,
        ...alternates,
        `    <lastmod>${lastmod(lang)}</lastmod>`,
        "  </url>",
      ].join("\n")
    )
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`
}

export function renderRobots(site: string, indexable: boolean): string {
  if (!indexable) return "User-agent: *\nDisallow: /\n"
  return `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`
}
