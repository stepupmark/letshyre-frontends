import { fileURLToPath } from "node:url"

import { test as base, expect, type Page, type Route } from "@playwright/test"
import { loadEnv } from "vite"

const API = new URL(
  loadEnv("production", fileURLToPath(new URL("..", import.meta.url)), "VITE_")
    .VITE_API_BASE_URL ?? "https://api.letshyre.ai"
).origin

// shape of POST user/v1/login/ for an admin
export const ADMIN = {
  id: "8d1f6c2e-0000-4000-8000-000000000001",
  name: null,
  username: "admin",
  email: "admin@letshyre.ai",
  phone_number: null,
  role: "Admin",
  is_active: true,
  is_superuser: true,
  is_profile_completed: false,
}

export const CREDIT = {
  success: true,
  data: { id: "1", credit_value: "50.00", is_active: true },
}

export const signedIn = (user: Record<string, unknown>) => ({
  success: true,
  message: "Login successful",
  data: { ...user, access_token: "new-access", refresh_token: "new-refresh" },
})

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
}

export const reply = (route: Route, json: unknown, status = 200) =>
  route.fulfill({ status, json, headers: CORS })

type Handler = ((route: Route) => Promise<void>) | Record<string, unknown>
type Handlers = Record<string, Handler>

const DEFAULTS: Handlers = {
  "GET /user/v1/admin/profile/": {
    success: true,
    data: { id: ADMIN.id, name: "Asha Rao", email: ADMIN.email },
  },
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
  signIn: () => Promise<void>
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
  signIn: async ({ page }, use) => {
    await use(async () => {
      await page.addInitScript((user) => {
        // once per tab, so a sign-out in the test sticks across reloads
        if (sessionStorage.getItem("e2e-seeded")) return
        sessionStorage.setItem("e2e-seeded", "1")
        localStorage.setItem("accessToken", "e2e-access")
        localStorage.setItem("refreshToken", "e2e-refresh")
        localStorage.setItem("user", JSON.stringify(user))
      }, ADMIN)
    })
  },
})

export { expect }

// collects console errors, uncaught errors and CSP violations
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
