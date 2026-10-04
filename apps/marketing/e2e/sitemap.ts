import { readFileSync } from "node:fs"

// the sitemap is exactly the set of prerendered pages, so specs iterate it
const xml = readFileSync(
  new URL("../build/client/sitemap.xml", import.meta.url),
  "utf8"
)

export interface SitemapPage {
  path: string
  lang: string
  /** hreflang → path, without x-default */
  alternates: Map<string, string>
}

export const SITEMAP: SitemapPage[] = [
  ...xml.matchAll(/<url>([\s\S]*?)<\/url>/g),
].map(([, entry = ""]) => {
  const path = new URL(/<loc>([^<]+)<\/loc>/.exec(entry)?.[1] ?? "").pathname
  return {
    path,
    lang: path.split("/")[1] ?? "",
    alternates: new Map(
      [...entry.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)]
        .filter(([, lang]) => lang !== "x-default")
        .map(([, lang = "", href = ""]) => [lang, new URL(href).pathname])
    ),
  }
})

export const RTL = new Set(["ar", "ur"])

/** Other locales only add translated copy, so the chromium project covers them. */
export const otherEngine = (lang: string, project: string) =>
  lang !== "en" && project !== "chromium"
