const { existsSync } = require("node:fs")

const PORT = 4180
const PAGES = [
  "",
  "/home-v2",
  "/pricing",
  "/interview-guide",
  "/contact",
  "/terms",
  "/blogs",
  "/blogs/why-we-built-letshyre",
]

// Arabic joins once it's translated, so RTL layout gets measured too
const urls = ["en", "ar"].flatMap((lang) =>
  PAGES.map((page) => `/${lang}${page}`)
    .filter((path) => existsSync(`build/client${path}/index.html`))
    .map((path) => `http://localhost:${PORT}${path}`)
)

const ASSERTIONS = {
  "categories:accessibility": ["error", { minScore: 0.95 }],
  "categories:best-practices": ["error", { minScore: 0.95 }],
  "categories:seo": ["error", { minScore: 1 }],
  "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
  // targets, not gates yet: hydrating React on slow 4G keeps these short of them
  "categories:performance": ["warn", { minScore: 0.9 }],
  "largest-contentful-paint": ["warn", { maxNumericValue: 2000 }],
  "total-blocking-time": ["warn", { maxNumericValue: 200 }],
}

module.exports = {
  ci: {
    collect: {
      url: urls,
      startServerCommand: `node e2e/serve.ts ${PORT}`,
      startServerReadyPattern: "serving",
      numberOfRuns: 3,
      settings: {
        // non-production builds are noindex on purpose; postbuild checks robots per environment
        skipAudits: ["is-crawlable"],
      },
    },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: "^(?!.*/pricing$)", assertions: ASSERTIONS },
        {
          // the live API refuses localhost, so this measures the price error state
          matchingUrlPattern: "/pricing$",
          assertions: {
            ...ASSERTIONS,
            "categories:best-practices": ["warn", { minScore: 0.95 }],
            "cumulative-layout-shift": ["warn", { maxNumericValue: 0.05 }],
          },
        },
      ],
    },
    upload: { target: "filesystem", outputDir: "lighthouse-report" },
  },
}
