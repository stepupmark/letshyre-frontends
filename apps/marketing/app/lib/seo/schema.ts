import { LOCALES, type Locale, localePath } from "@workspace/i18n"
import { z } from "zod"

import type { Author } from "../blog/authors"
import { absUrl, SITE } from "./site"

// parsed in the browser on every page; skip zod's new Function() probe, which the CSP reports
z.config({ jitless: true })

export type JsonLd = Record<string, unknown>

export const organizationSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: absUrl("/icon-512.png"),
  sameAs: SITE.sameAs,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: SITE.email,
    url: absUrl("/en/contact"),
    availableLanguage: LOCALES,
  },
})

export const websiteSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: SITE.domain,
  url: SITE.url,
  inLanguage: LOCALES,
  publisher: { "@id": `${SITE.url}/#organization` },
})

/** A node on another part of the graph, by `@id`. */
export const ref = (fragment: string) => ({ "@id": `${SITE.url}/#${fragment}` })

export function webPageSchema({
  type = "WebPage",
  lang,
  path,
  name,
  description,
  dateModified,
  about,
  mainEntity,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage"
  lang: Locale
  path: string
  name: string
  description: string
  dateModified?: string
  /** What the page is about, by `ref()`; it must be defined on the same page. */
  about?: JsonLd
  mainEntity?: JsonLd
}): JsonLd {
  const url = absUrl(localePath(lang, path))
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": `${SITE.url}/#website` },
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: lang,
    ...(dateModified ? { dateModified } : {}),
    ...(about ? { about } : {}),
    ...(mainEntity ? { mainEntity } : {}),
  }
}

/** The posts a blog listing shows, in order, for a CollectionPage's `mainEntity`. */
export const postListSchema = (
  lang: Locale,
  posts: readonly { path: string; name: string }[]
): JsonLd => ({
  "@type": "ItemList",
  itemListElement: posts.map((post, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: absUrl(localePath(lang, post.path)),
    name: post.name,
  })),
})

export function blogPostingSchema({
  lang,
  path,
  headline,
  description,
  datePublished,
  dateModified,
  image = "/og/default.jpg",
  author,
}: {
  lang: Locale
  path: string
  headline: string
  description: string
  datePublished: string
  dateModified: string
  image?: string
  author?: Author
}): JsonLd {
  const url = absUrl(localePath(lang, path))
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline,
    description,
    datePublished,
    dateModified,
    inLanguage: lang,
    image: absUrl(image),
    // unsigned posts are the team's, so the organization is their author (ADR 0021)
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          jobTitle: author.jobTitle,
          ...(author.url ? { url: author.url, sameAs: [author.url] } : {}),
        }
      : { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
    isPartOf: { "@id": `${SITE.url}/#website` },
  }
}

/** Home is prepended. Paths are relative to the locale. */
export const breadcrumbSchema = (
  lang: Locale,
  homeName: string,
  trail: { name: string; path: string }[]
): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: homeName, path: "" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absUrl(localePath(lang, crumb.path)),
  })),
})

const stripTags = (text: string) => text.replace(/<[^>]+>/g, "")

const faqItem = z.object({ q: z.string(), a: z.string() })
const faqItems = z.union([
  z.array(faqItem),
  z.record(z.string(), faqItem).transform((items) => Object.values(items)),
])

/** Takes `faq.items` as i18next returns it, a list or a keyed object; fails the build if malformed. */
export const faqSchema = (items: unknown): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.parse(items).map((item) => ({
    "@type": "Question",
    name: stripTags(item.q),
    acceptedAnswer: { "@type": "Answer", text: stripTags(item.a) },
  })),
})

export const softwareApplicationSchema = ({
  id,
  name,
  description,
  os,
  url,
  downloadUrl,
}: {
  /** Fragment for its `@id`, so pages can point at it. */
  id: string
  name: string
  description: string
  os: string
  url: string
  downloadUrl?: string
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  ...ref(id),
  name,
  description,
  operatingSystem: os,
  applicationCategory: "BusinessApplication",
  url,
  ...(downloadUrl && { downloadUrl }),
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@id": `${SITE.url}/#organization` },
})
