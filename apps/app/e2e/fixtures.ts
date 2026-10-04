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

/** Default answers, keyed "METHOD path". Tests override per endpoint. */
const DEFAULTS: Handlers = {
  "GET /payment/v1/employer_credits/": {
    success: true,
    data: { available_credits: 12 },
  },
}

type Handler = ((route: Route) => Promise<void>) | Record<string, unknown>
type Handlers = Record<string, Handler>

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
}

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
  signInAs: (who: keyof typeof USERS) => Promise<void>
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
    await use(async (who) => {
      await page.addInitScript((user) => {
        // once per tab, so a sign-out in the test sticks across reloads
        if (sessionStorage.getItem("e2e-seeded")) return
        sessionStorage.setItem("e2e-seeded", "1")
        localStorage.setItem("accessToken", "e2e-access")
        localStorage.setItem("refreshToken", "e2e-refresh")
        localStorage.setItem("user", JSON.stringify(user))
      }, USERS[who])
    })
  },
})

export { expect }
