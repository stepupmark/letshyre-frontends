import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import { HttpError, ResponseShapeError } from "../src/errors.ts"
import {
  getCreditPrice,
  getLatestRelease,
  getPublicPlans,
  sendAssistantMessage,
  sendContactMessage,
  subscribe,
} from "../src/public/index.ts"
import { client, server, url } from "./server.ts"

const plan = (overrides: object = {}) => ({
  id: "p1",
  slug: "starter",
  name: "Starter",
  credits_included: "5",
  base_price: "0",
  per_credit_effective_rate: null,
  plan_type: "free",
  highlight: false,
  sort_order: 2,
  ...overrides,
})

describe("contact", () => {
  it("posts the message and returns the backend's reply", async () => {
    let body: unknown
    server.use(
      http.post(url("commonapp/v1/contact/"), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({
          success: true,
          message: "We'll be in touch",
        })
      })
    )
    const input = {
      name: "Asha",
      email: "a@b.co",
      subject: "Demo",
      message: "Hello there",
    }
    expect(await sendContactMessage(client(), input)).toEqual({
      message: "We'll be in touch",
    })
    expect(body).toEqual(input)
  })

  it("surfaces a rejected submission", async () => {
    server.use(
      http.post(url("commonapp/v1/contact/"), () =>
        HttpResponse.json(
          { success: false, message: "Too many requests" },
          { status: 429 }
        )
      )
    )
    await expect(
      sendContactMessage(client(), {
        name: "a",
        email: "a@b.co",
        subject: "s",
        message: "m",
      })
    ).rejects.toMatchObject({
      status: 429,
      backendMessage: "Too many requests",
    })
  })
})

describe("newsletter", () => {
  it("subscribes an email", async () => {
    let body: unknown
    server.use(
      http.post(url("commonapp/v1/stay_updated/"), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ success: true, message: "Subscribed" })
      })
    )
    expect(await subscribe(client(), "a@b.co")).toEqual({
      message: "Subscribed",
    })
    expect(body).toEqual({ email: "a@b.co" })
  })

  it("treats success: false on a 200 as an error", async () => {
    server.use(
      http.post(url("commonapp/v1/stay_updated/"), () =>
        HttpResponse.json({ success: false, message: "Already subscribed" })
      )
    )
    await expect(subscribe(client(), "a@b.co")).rejects.toBeInstanceOf(
      HttpError
    )
  })
})

describe("pricing", () => {
  it("returns sorted plans and drops malformed ones", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    server.use(
      http.get(url("finances/v1/credit_plans/public/"), () =>
        HttpResponse.json({
          success: true,
          data: {
            results: [
              plan(),
              plan({
                id: "p2",
                slug: "pro",
                name: "Pro",
                sort_order: 1,
                per_credit_effective_rate: "99.5",
                tagline: "Popular",
                highlight: true,
              }),
              plan({ id: "", slug: "broken" }),
            ],
          },
        })
      )
    )

    const plans = await getPublicPlans(client())
    expect(plans.map((p) => p.slug)).toEqual(["pro", "starter"])
    expect(plans[0]).toEqual({
      id: "p2",
      slug: "pro",
      name: "Pro",
      credits: 5,
      basePrice: 0,
      rate: 99.5,
      planType: "free",
      tagline: "Popular",
      highlight: true,
      sortOrder: 1,
    })
    expect(warn).toHaveBeenCalledOnce()
  })

  it("fails when no plan is usable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    server.use(
      http.get(url("finances/v1/credit_plans/public/"), () =>
        HttpResponse.json({ success: true, data: { results: [{}] } })
      )
    )
    await expect(getPublicPlans(client())).rejects.toBeInstanceOf(
      ResponseShapeError
    )
  })

  it("prices a single credit", async () => {
    let tokens: string | null = null
    server.use(
      http.get(
        url("payment/v1/public/calculate-token-cost/"),
        ({ request }) => {
          tokens = new URL(request.url).searchParams.get("tokens")
          return HttpResponse.json({
            success: true,
            data: { cost_per_token: "49.00" },
          })
        }
      )
    )
    expect(await getCreditPrice(client())).toEqual({ costPerCredit: 49 })
    expect(tokens).toBe("1")
  })

  it("rejects a zero price", async () => {
    server.use(
      http.get(url("payment/v1/public/calculate-token-cost/"), () =>
        HttpResponse.json({ success: true, data: { cost_per_token: 0 } })
      )
    )
    await expect(getCreditPrice(client())).rejects.toBeInstanceOf(
      ResponseShapeError
    )
  })
})

describe("desktop app", () => {
  it("picks the release for the requested OS from a list", async () => {
    server.use(
      http.get(url("commonapp/v1/desktop_app/mac/latest/"), () =>
        HttpResponse.json({
          success: true,
          data: [
            {
              platform: "Windows",
              available: true,
              original_filename: "LetsHyre.exe",
            },
            { platform: "Mac", available: false },
          ],
        })
      )
    )
    expect(await getLatestRelease(client(), "mac")).toEqual({
      platform: "mac",
      available: false,
      version: null,
      filename: null,
    })
  })

  it("accepts a single release object and returns null when none match", async () => {
    server.use(
      http.get(url("commonapp/v1/desktop_app/windows/latest/"), () =>
        HttpResponse.json({
          success: true,
          data: {
            platform: "windows",
            available: true,
            version: "1.4.0",
            original_filename: "LetsHyre.exe",
          },
        })
      ),
      http.get(url("commonapp/v1/desktop_app/mac/latest/"), () =>
        HttpResponse.json({ success: true, data: [] })
      )
    )
    expect(await getLatestRelease(client(), "windows")).toMatchObject({
      available: true,
      version: "1.4.0",
      filename: "LetsHyre.exe",
    })
    expect(await getLatestRelease(client(), "mac")).toBeNull()
  })
})

describe("assistant", () => {
  it("sends the session id after the first turn", async () => {
    const bodies: unknown[] = []
    server.use(
      http.post(url("commonapp/v1/chatbot/chat/"), async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({
          success: true,
          data: { session_id: "s1", response: "**Hi**" },
        })
      })
    )
    const first = await sendAssistantMessage(client(), { message: "Hello" })
    await sendAssistantMessage(client(), {
      message: "More",
      sessionId: first.sessionId,
    })

    expect(first).toEqual({ sessionId: "s1", response: "**Hi**" })
    expect(bodies).toEqual([
      { message: "Hello" },
      { message: "More", session_id: "s1" },
    ])
  })

  it("never sends an auth header from the public client", async () => {
    let auth: string | null = "unset"
    server.use(
      http.post(url("commonapp/v1/chatbot/chat/"), ({ request }) => {
        auth = request.headers.get("authorization")
        return HttpResponse.json({
          success: true,
          data: { session_id: "s", response: "" },
        })
      })
    )
    await sendAssistantMessage(client(), { message: "Hi" })
    expect(auth).toBeNull()
  })
})
