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
    page: "/how-it-works-interview",
    field: "title",
    reason: "renamed to Interview Guide along with its URL",
  },
  {
    page: "/how-it-works-interview",
    field: "description",
    reason: "rewritten around what candidates search for",
  },
  {
    page: "/how-it-works-interview",
    field: "ogImage",
    reason: "renamed to match the new /interview-guide URL",
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
  {
    page: "",
    field: "title",
    reason: "home copy rewritten around hiring experienced professionals",
  },
  {
    page: "",
    field: "description",
    reason: "home copy rewritten around hiring experienced professionals",
  },
  {
    page: "",
    field: "faqQuestions",
    reason: "the rewritten home FAQ has one more question",
  },
  {
    page: "/about",
    field: "title",
    reason: "names the company and what it does instead of a generic About Us",
  },
  {
    page: "/contact",
    field: "title",
    reason: "says who the page reaches instead of a generic Contact Us",
  },
  {
    page: "/download",
    field: "jsonLd",
    reason: "the page now has an FAQ, published as FAQPage",
  },
  {
    page: "/download",
    field: "faqQuestions",
    reason: "the page now has an FAQ, published as FAQPage",
  },
  ...(["/terms", "/policy", "/refund-policy"] as const).map((page) => ({
    page,
    field: "title" as const,
    reason: "legal titles in sentence case, like every other heading",
  })),
]
