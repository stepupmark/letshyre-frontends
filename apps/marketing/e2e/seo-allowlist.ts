// Intended differences from docs/baseline/seo-baseline.json, per page in every locale. Each needs a reason.

export const SEO_ALLOWLIST: {
  /** without the locale: "" for home, "/pricing" */
  page: string
  field: "title" | "description" | "ogImage" | "jsonLd" | "faqQuestions"
  reason: string
}[] = [
  {
    page: "/how-it-works-interview",
    field: "jsonLd",
    reason:
      "HowTo dropped: Google retired HowTo rich results in 2023, the steps stay as plain content (plan 3.5)",
  },
  {
    page: "/policy",
    field: "ogImage",
    reason: "renamed with the page, which moved to /privacy-policy",
  },
  {
    page: "/pricing",
    field: "description",
    reason:
      "the Free plan gives 10 credits, not the 5 the old description said",
  },
]
