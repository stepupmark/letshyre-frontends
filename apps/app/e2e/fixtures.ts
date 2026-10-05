import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { test as base, expect, type Page, type Route } from "@playwright/test"
import { loadEnv } from "vite"

const API = new URL(
  loadEnv("production", fileURLToPath(new URL("..", import.meta.url)), "VITE_")
    .VITE_API_BASE_URL ?? "https://api.letshyre.ai"
).origin

export const USERS = {
  employer: {
    role: "Employer",
    is_profile_completed: true,
    email: "employer@test.in",
  },
  employerNew: {
    role: "Employer",
    is_profile_completed: false,
    email: "new@test.in",
  },
  candidate: { role: "Candidate", email: "candidate@test.in" },
} as const

export const fixture = (file: string) =>
  JSON.parse(
    readFileSync(new URL(`api/${file}`, import.meta.url), "utf8")
  ) as Record<string, unknown>

/** GET answers from e2e/api, keyed "GET /path/". Tests override per endpoint. */
const DEFAULTS: Handlers = {
  ...Object.fromEntries(
    readdirSync(new URL("api", import.meta.url))
      .filter((file) => file.endsWith(".json"))
      .map((file) => [
        `GET /${file.slice(0, -5).replaceAll(".", "/")}/`,
        fixture(file),
      ])
  ),
  // the API reads a candidate's own profile with a POST
  "POST /user/v1/candidate_profile/": fixture("user.v1.candidate_profile.json"),
}

type Handler = ((route: Route) => Promise<void>) | Record<string, unknown>
type Handlers = Record<string, Handler>

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
}

/** Answers a mocked call from a handler, with the CORS headers the browser needs. */
export const reply = (route: Route, json: unknown, status = 200) =>
  route.fulfill({ status, json, headers: CORS })

/** The browser never reaches the real API; unknown calls fail the test. */
async function mockApi(page: Page, overrides: Handlers, unhandled: string[]) {
  const handlers: Handlers = { ...DEFAULTS, ...overrides }
  await page.route(`${API}/**`, async (route) => {
    const request = route.request()
    if (request.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: CORS })
    const key = `${request.method()} ${new URL(request.url()).pathname}`
    const handler = handlers[key]
    if (typeof handler === "function") return handler(route)
    if (handler === undefined) {
      unhandled.push(key)
      return route.fulfill({ status: 501, headers: CORS, json: {} })
    }
    return route.fulfill({ status: 200, headers: CORS, json: handler })
  })
}

export const test = base.extend<{
  api: (overrides: Handlers) => Promise<void>
  /** `tips: true` leaves the one-time tips unseen */
  signInAs: (
    who: keyof typeof USERS,
    options?: { tips?: boolean }
  ) => Promise<void>
}>({
  api: [
    async ({ page }, use) => {
      const unhandled: string[] = []
      await mockApi(page, {}, unhandled)
      await use((overrides) => mockApi(page, overrides, unhandled))
      expect(unhandled, "API calls without a mock").toEqual([])
    },
    { auto: true },
  ],
  signInAs: async ({ page }, use) => {
    await use(async (who, { tips = false } = {}) => {
      await page.addInitScript(
        ({ user, tips }) => {
          // once per tab, so a sign-out in the test sticks across reloads
          if (sessionStorage.getItem("e2e-seeded")) return
          sessionStorage.setItem("e2e-seeded", "1")
          localStorage.setItem("accessToken", "e2e-access")
          localStorage.setItem("refreshToken", "e2e-refresh")
          localStorage.setItem("user", JSON.stringify(user))
          if (!tips) localStorage.setItem("tips:v1:seen", "search,credits")
        },
        { user: USERS[who], tips }
      )
    })
  },
})

export { expect }

// fails the test on any console error, uncaught error or CSP violation
export function watch(page: Page) {
  const problems: string[] = []
  page.on("pageerror", (e) => problems.push(e.message))
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(m.text())
  })
  void page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`)
    })
  })
  return problems
}
