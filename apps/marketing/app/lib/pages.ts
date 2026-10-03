// Pure data: imported by react-router.config.ts and lh-i18n, so no Vite-only imports here.

export interface PageDef {
  path: string
  namespaces: readonly string[]
  og: string
}

export const PAGES = {
  home: { path: "", namespaces: ["home"], og: "home" },
  pricing: { path: "/pricing", namespaces: ["pricing"], og: "pricing" },
  interview: {
    path: "/how-it-works-interview",
    namespaces: ["interview"],
    og: "how-it-works-interview",
  },
  download: { path: "/download", namespaces: ["download"], og: "download" },
  contact: { path: "/contact", namespaces: ["contact"], og: "contact" },
  about: { path: "/about", namespaces: ["about"], og: "about" },
  terms: { path: "/terms", namespaces: ["legalTerms"], og: "terms" },
  privacy: { path: "/policy", namespaces: ["legalPolicy"], og: "policy" },
  refund: {
    path: "/refund-policy",
    namespaces: ["legalRefund"],
    og: "refund-policy",
  },
} as const satisfies Record<string, PageDef>

export type PageId = keyof typeof PAGES

export const LAYOUT_NAMESPACES = ["common", "seo"] as const

export const pageNamespaces = (id: PageId): string[] => [
  ...LAYOUT_NAMESPACES,
  ...PAGES[id].namespaces,
]
