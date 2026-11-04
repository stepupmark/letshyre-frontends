// Pure data: imported by react-router.config.ts and lh-i18n, so no Vite-only imports here.

export interface PageDef {
  path: string
  namespaces: readonly string[]
  og: string
}

export const PAGES = {
  home: { path: "", namespaces: ["home"], og: "home" },
  homeV2: { path: "/home-v2", namespaces: ["homeV2", "home"], og: "home" },
  homeV3: { path: "/home-v3", namespaces: ["homeV3"], og: "home" },
  employers: {
    path: "/employers",
    namespaces: ["employers"],
    og: "employer-guide",
  },
  candidates: {
    path: "/candidates",
    namespaces: ["candidates"],
    og: "candidate-guide",
  },
  pricing: { path: "/pricing", namespaces: ["pricing"], og: "pricing" },
  interview: {
    path: "/interview-guide",
    namespaces: ["interview"],
    og: "interview-guide",
  },
  employerGuide: {
    path: "/employer-guide",
    namespaces: ["employerGuide"],
    og: "employer-guide",
  },
  candidateGuide: {
    path: "/candidate-guide",
    namespaces: ["candidateGuide"],
    og: "candidate-guide",
  },
  download: { path: "/download", namespaces: ["download"], og: "download" },
  contact: { path: "/contact", namespaces: ["contact"], og: "contact" },
  about: { path: "/about", namespaces: ["about"], og: "about" },
  terms: { path: "/terms", namespaces: ["legalTerms"], og: "terms" },
  privacy: {
    path: "/privacy-policy",
    namespaces: ["legalPolicy"],
    og: "privacy-policy",
  },
  refund: {
    path: "/refund-policy",
    namespaces: ["legalRefund"],
    og: "refund-policy",
  },
} as const satisfies Record<string, PageDef>

/** Old page paths and where they live now. Hosts answer these with a 301. */
export const MOVED_PATHS: Readonly<Record<string, string>> = {
  "/policy": "/privacy-policy",
  "/how-it-works-interview": "/interview-guide",
}

export type PageId = keyof typeof PAGES

/** Pages up for review: noindex and left out of the sitemap. */
export const PREVIEW_PAGES: readonly PageId[] = ["homeV2", "homeV3"]

/** A retiring page and its successor. Each locale moves over (301) once the successor ships there. */
export const REPLACED_BY: Partial<Record<PageId, PageId>> = {
  interview: "candidateGuide",
}

/** Drops each retiring page from the locales its successor already ships in. */
export function withoutReplaced<L>(ready: Map<PageId, L[]>): Map<PageId, L[]> {
  return new Map(
    [...ready].map(([id, locales]) => {
      const next = REPLACED_BY[id]
      const taken = next ? (ready.get(next) ?? []) : []
      return [id, locales.filter((lang) => !taken.includes(lang))]
    })
  )
}

export const LAYOUT_NAMESPACES = ["common", "seo"] as const

export const pageNamespaces = (id: PageId): string[] => [
  ...LAYOUT_NAMESPACES,
  ...PAGES[id].namespaces,
]
