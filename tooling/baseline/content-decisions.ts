// First matching rule wins. Regenerate the report with: node tooling/baseline/content-inventory.ts

export type Decision = "keep" | "rewrite" | "drop" | "move"
export type Rule = { pattern: string; decision: Decision; note?: string }

export const MARKETING_NAMESPACES = [
  "common",
  "seo",
  "home",
  "about",
  "pricing",
  "interview",
  "download",
  "contact",
  "legal",
  "legalTerms",
  "legalPolicy",
  "legalRefund",
] as const

const HL = "Inline <hl>/<br/> markup is rendered as plain text in the new design, so translations stay valid."

export const RULES: Rule[] = [
  { pattern: "common:nav.home", decision: "drop", note: "Logo links home; no 'Home' nav item." },
  { pattern: "common:nav.scorecards", decision: "drop", note: "Was an anchor link; scorecards become a home section." },
  { pattern: "common:nav.languageSuggested", decision: "keep" },
  { pattern: "common:nav.*", decision: "keep" },
  { pattern: "common:footer.tagline", decision: "rewrite", note: "'revolutionizing' is hype. One plain sentence on what LetsHyre does." },
  { pattern: "common:footer.*", decision: "keep" },
  { pattern: "common:newsletter.*", decision: "keep" },
  { pattern: "common:pagination.*", decision: "move", note: "Only the dashboards paginate." },
  { pattern: "common:*", decision: "keep" },

  { pattern: "seo:homeCrumb", decision: "keep" },
  { pattern: "seo:notFound.*", decision: "keep" },
  { pattern: "seo:*", decision: "move", note: "Titles for auth/dashboard routes, which move to apps/app." },

  { pattern: "home:hero.badgeNew", decision: "drop", note: "Decorative badge." },
  { pattern: "home:hero.badgeText", decision: "drop", note: "'100% AI-Screened' is an absolute claim we can't evidence on the page." },
  { pattern: "home:hero.title", decision: "keep", note: `Clear positioning. ${HL}` },
  { pattern: "home:hero.description", decision: "rewrite", note: "Keep the first sentence. Drop the 'dream team' cliché." },
  { pattern: "home:hero.ctaHiring", decision: "keep" },
  { pattern: "home:hero.ctaJob", decision: "keep" },
  { pattern: "home:hero.tagline.*", decision: "keep", note: "Strong line. Candidate for the final CTA heading." },
  { pattern: "home:hero.*", decision: "drop", note: "Labels for the old floating hero cards and image." },
  { pattern: "home:assistance.ariaLabel", decision: "keep" },
  { pattern: "home:assistance.steps.hire.*", decision: "drop", note: "'PSI-backed statistical forecast of performance and retention': confirm it's real before reintroducing it." },
  { pattern: "home:assistance.steps.*.link", decision: "drop", note: "Old anchor links." },
  { pattern: "home:assistance.steps.*.imageAlt", decision: "drop", note: "Old illustrations." },
  { pattern: "home:assistance.steps.*.pill", decision: "keep", note: "Becomes the step label." },
  { pattern: "home:assistance.steps.*.heading", decision: "keep", note: HL },
  { pattern: "home:assistance.steps.*", decision: "rewrite", note: "Shorter and concrete: what happens, who does it, what you get." },
  { pattern: "home:candidate.items.interview.*", decision: "rewrite", note: "Mention the desktop app and the 8-step guide." },
  { pattern: "home:candidate.*", decision: "rewrite", note: "Generic ('Dream Job Matched by AI'). Replace with concrete candidate benefits (90-day active profile, one interview → many employers)." },
  { pattern: "home:video.*", decision: "keep", note: "The demo video stays." },
  { pattern: "home:scorecard.*", decision: "drop", note: "Unbacked stats (Accuracy/Uptime/Faster), filler tags, 'predictive' scores. Replaced by a new 'Inside a scorecard' section (rewrite, new keys)." },
  { pattern: "home:faq.eyebrow", decision: "drop" },
  { pattern: "home:faq.*", decision: "keep", note: "FAQ items also feed FAQPage JSON-LD." },
  { pattern: "home:hireCard.description", decision: "rewrite", note: "Hype ('future of recruitment')." },
  { pattern: "home:hireCard.*", decision: "keep" },
  { pattern: "home:chatbot.*", decision: "keep", note: "Moves to the `assistant` namespace with the widget." },
  { pattern: "home:meta.*", decision: "keep" },

  { pattern: "about:hero.badge", decision: "drop" },
  { pattern: "about:hero.imgAlt", decision: "drop" },
  { pattern: "about:whatWeDo.*ImgAlt", decision: "drop" },
  { pattern: "about:hero.title", decision: "keep", note: HL },
  { pattern: "about:intro.title", decision: "keep", note: HL },
  { pattern: "about:*", decision: "keep", note: "Factual and policy copy." },

  { pattern: "pricing:checkout.*", decision: "move", note: "Checkout moves to /employer/billing in the app." },
  { pattern: "pricing:*", decision: "keep", note: "Recent, concrete copy. English-only today, so no translations exist yet." },

  { pattern: "interview:badge", decision: "drop" },
  { pattern: "interview:*", decision: "keep", note: "Clear, specific step-by-step copy." },
  { pattern: "download:features.*", decision: "rewrite", note: "'Highly stable' is vague. Say what the app does (proctored, full-screen, blocks other apps)." },
  { pattern: "download:*", decision: "keep" },
  { pattern: "contact:info.badge", decision: "drop" },
  { pattern: "contact:info.helpCenter", decision: "drop", note: "No help center exists." },
  { pattern: "contact:info.title", decision: "keep", note: HL },
  { pattern: "contact:*", decision: "keep" },

  { pattern: "legal:chrome.collapseSidebar", decision: "drop", note: "New layout has a sticky TOC, not a collapsible sidebar." },
  { pattern: "legal:chrome.expandSidebar", decision: "drop" },
  { pattern: "legal:chrome.searchPlaceholder", decision: "drop", note: "Section search removed. Native find-in-page works on a plain document." },
  { pattern: "legal:chrome.noMatches", decision: "drop" },
  { pattern: "legal:chrome.feedback*", decision: "drop", note: "Feedback widget without a backend." },
  { pattern: "legal:*", decision: "keep" },
  { pattern: "legalTerms:*", decision: "keep", note: "Legal text is never rewritten by the redesign." },
  { pattern: "legalPolicy:*", decision: "keep", note: "Legal text is never rewritten by the redesign." },
  { pattern: "legalRefund:*", decision: "keep", note: "Legal text is never rewritten by the redesign." },
]
