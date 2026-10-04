// Intended differences from docs/baseline/seo-baseline.json. Each needs a reason.

export const SEO_ALLOWLIST: {
  path: string
  field: "title" | "description" | "ogImage" | "jsonLd" | "faqQuestions"
  reason: string
}[] = [
  {
    path: "/en/how-it-works-interview",
    field: "jsonLd",
    reason:
      "HowTo dropped: Google retired HowTo rich results in 2023, the steps stay as plain content (plan 3.5)",
  },
]
