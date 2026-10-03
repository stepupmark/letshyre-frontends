import type { Page, Route } from "@playwright/test"

// Pages call the API from the browser; tests never reach the real one.

const plan = (overrides: Record<string, unknown>) => ({
  per_credit_effective_rate: "49",
  plan_type: "paid_one_time",
  tagline: null,
  highlight: false,
  ...overrides,
})

export const PLANS = {
  success: true,
  data: {
    results: [
      plan({
        id: "p-free",
        slug: "free",
        name: "Free",
        credits_included: 0,
        base_price: "0",
        per_credit_effective_rate: null,
        plan_type: "free",
        sort_order: 0,
      }),
      plan({
        id: "p-pro",
        slug: "pro",
        name: "Pro",
        credits_included: 50,
        base_price: "2450",
        sort_order: 1,
      }),
      plan({
        id: "p-business",
        slug: "business",
        name: "Business",
        credits_included: 100,
        base_price: "4900",
        highlight: true,
        sort_order: 2,
      }),
    ],
  },
}

export const CREDIT_PRICE = { success: true, data: { cost_per_token: "49.00" } }

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
}

const reply = (route: Route, status: number, body?: unknown) =>
  route.request().method() === "OPTIONS"
    ? route.fulfill({ status: 204, headers: CORS })
    : route.fulfill({ status, headers: CORS, json: body })

export async function mockApi(
  page: Page,
  { prices = "ok" }: { prices?: "ok" | "fail" | "hang" } = {}
) {
  const pricing = async (route: Route, body: unknown) => {
    if (prices === "hang") return
    await reply(route, prices === "fail" ? 500 : 200, body)
  }
  await page.route("**/finances/v1/credit_plans/public/**", (route) =>
    pricing(route, PLANS)
  )
  await page.route("**/payment/v1/public/calculate-token-cost/**", (route) =>
    pricing(route, CREDIT_PRICE)
  )
  await page.route("**/commonapp/v1/stay_updated/**", (route) =>
    reply(route, 200, { success: true, message: "Subscribed" })
  )
}
