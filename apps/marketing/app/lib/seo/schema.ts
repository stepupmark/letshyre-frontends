import { LOCALES, type Locale, localePath } from "@workspace/i18n"
import { z } from "zod"

import { absUrl, SITE } from "./site"

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
  url: SITE.url,
  publisher: { "@id": `${SITE.url}/#organization` },
})

export function webPageSchema({
  type = "WebPage",
  lang,
  path,
  name,
  description,
  dateModified,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage"
  lang: Locale
  path: string
  name: string
  description: string
  dateModified?: string
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
  name,
  description,
  os,
  url,
  downloadUrl,
}: {
  name: string
  description: string
  os: string
  url: string
  downloadUrl?: string
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name,
  description,
  operatingSystem: os,
  applicationCategory: "BusinessApplication",
  url,
  ...(downloadUrl && { downloadUrl }),
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@id": `${SITE.url}/#organization` },
})
