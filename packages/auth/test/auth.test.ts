import { createHttpClient, HttpError } from "@workspace/api"
import { delay, http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import { createAuthedClient } from "../src/client.ts"
import { authRedirect, guestRedirect, safeNext } from "../src/guards.ts"
import {
  AccountInactiveError,
  login,
  logout,
  RoleNotAllowedError,
} from "../src/service.ts"
import { readSession, subscribe } from "../src/session.ts"

const BASE = "https://api.test/"
const url = (path: string) => new URL(path, BASE).href
const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
})
afterEach(() => {
  server.resetHandlers()
  vi.unstubAllGlobals()
})
afterAll(() => {
  server.close()
})
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

function signIn(user: Record<string, unknown> = { role: "Employer" }) {
  localStorage.setItem("accessToken", "old-access")
  localStorage.setItem("refreshToken", "old-refresh")
  localStorage.setItem("user", JSON.stringify(user))
}

describe("token refresh", () => {
  it("refreshes once for concurrent 401s and saves the rotated tokens", async () => {
    signIn()
    let refreshes = 0
    server.use(
      http.get(url("jobs/"), ({ request }) =>
        request.headers.get("authorization") === "Bearer new-access"
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({}, { status: 401 })
      ),
      http.post(url("user/v1/login_refresh/"), async ({ request }) => {
        refreshes++
        expect(await request.json()).toEqual({ refresh_token: "old-refresh" })
        await delay(20)
        return HttpResponse.json({
          success: true,
          data: { access_token: "new-access", refresh_token: "new-refresh" },
        })
      })
    )
    const client = createAuthedClient({
      baseUrl: BASE,
      onSessionExpired: vi.fn(),
    })

    await Promise.all([
      client.get("/jobs/"),
      client.get("/jobs/"),
      client.get("/jobs/"),
    ])

    expect(refreshes).toBe(1)
    expect(localStorage.getItem("accessToken")).toBe("new-access")
    expect(localStorage.getItem("refreshToken")).toBe("new-refresh")
  })

  it("ends the session once when the refresh token is dead", async () => {
    signIn()
    server.use(
      http.get(url("jobs/"), () => HttpResponse.json({}, { status: 401 })),
      http.post(url("user/v1/login_refresh/"), () =>
        HttpResponse.json({}, { status: 401 })
      )
    )
    const onSessionExpired = vi.fn()
    const client = createAuthedClient({ baseUrl: BASE, onSessionExpired })

    const results = await Promise.allSettled([
      client.get("/jobs/"),
      client.get("/jobs/"),
    ])

    expect(results.every((r) => r.status === "rejected")).toBe(true)
    expect(onSessionExpired).toHaveBeenCalledOnce()
    expect(readSession().status).toBe("guest")
    expect(localStorage.getItem("refreshToken")).toBeNull()
  })

  it("reuses a token another tab rotated instead of spending the refresh token", async () => {
    signIn()
    let refreshes = 0
    server.use(
      http.get(url("jobs/"), ({ request }) =>
        request.headers.get("authorization") === "Bearer other-tab"
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({}, { status: 401 })
      ),
      http.post(url("user/v1/login_refresh/"), () => {
        refreshes++
        return HttpResponse.json({}, { status: 401 })
      })
    )
    vi.stubGlobal("navigator", {
      locks: {
        request: (_name: string, run: () => Promise<unknown>) => {
          localStorage.setItem("accessToken", "other-tab")
          return run()
        },
      },
    })
    const client = createAuthedClient({
      baseUrl: BASE,
      onSessionExpired: vi.fn(),
    })

    await expect(client.get("/jobs/")).resolves.toEqual({ ok: true })
    expect(refreshes).toBe(0)
  })

  it("lets a guest's 401 through without refreshing or expiring", async () => {
    server.use(
      http.get(url("public/"), () => HttpResponse.json({}, { status: 401 }))
    )
    const onSessionExpired = vi.fn()

    await expect(
      createAuthedClient({ baseUrl: BASE, onSessionExpired }).get("/public/")
    ).rejects.toBeInstanceOf(HttpError)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})

describe("login and logout", () => {
  const client = createHttpClient({ baseUrl: BASE })

  it("stores the tokens apart from the user record", async () => {
    server.use(
      http.post(url("user/v1/login/"), ({ request }) => {
        expect(request.headers.get("authorization")).toBeNull()
        return HttpResponse.json({
          success: true,
          data: {
            role: "Candidate",
            email: "a@b.in",
            access_token: "acc",
            refresh_token: "ref",
          },
        })
      })
    )

    const user = await login(client, { email: "a@b.in", password: "x" })

    expect(user.role).toBe("Candidate")
    expect(localStorage.getItem("refreshToken")).toBe("ref")
    expect(localStorage.getItem("user")).not.toContain("ref")
  })

  it("refuses an inactive account without storing anything", async () => {
    server.use(
      http.post(url("user/v1/login/"), () =>
        HttpResponse.json({ role: "Employer", access: "acc", is_active: false })
      )
    )

    await expect(
      login(client, { email: "a@b.in", password: "x" })
    ).rejects.toBeInstanceOf(AccountInactiveError)
    expect(localStorage.getItem("accessToken")).toBeNull()
  })

  it("refuses a role the app doesn't serve without storing anything", async () => {
    server.use(
      http.post(url("user/v1/login/"), () =>
        HttpResponse.json({ role: "Admin", access_token: "acc" })
      )
    )
    const credentials = { email: "a@b.in", password: "x" }

    await expect(login(client, credentials)).rejects.toBeInstanceOf(
      RoleNotAllowedError
    )
    expect(localStorage.getItem("accessToken")).toBeNull()
    await expect(
      login(client, credentials, { roles: ["Admin"] })
    ).resolves.toMatchObject({ role: "Admin" })
  })

  it("clears the session even when the server can't revoke it", async () => {
    signIn()
    localStorage.setItem("onboardingDraft", "keep")
    sessionStorage.setItem("chat:v1:42", "[]")
    sessionStorage.setItem("chat:v1:public", "[]")
    server.use(http.post(url("user/v1/logout/"), () => HttpResponse.error()))

    await logout(client)

    expect(readSession().status).toBe("guest")
    expect(localStorage.getItem("refreshToken")).toBeNull()
    expect(localStorage.getItem("onboardingDraft")).toBe("keep")
    expect(sessionStorage.getItem("chat:v1:42")).toBeNull()
    expect(sessionStorage.getItem("chat:v1:public")).toBe("[]")
  })
})

describe("guards", () => {
  const at = (path: string) => new URL(`https://letshyre.ai${path}`)

  it("sends signed-out visitors to sign in and back to the page they asked for", () => {
    expect(authRedirect(at("/employer/billing?checkout=pro"))).toBe(
      "/sign-in?next=%2Femployer%2Fbilling%3Fcheckout%3Dpro"
    )
  })

  it("keeps each role in its own area", () => {
    signIn({ role: "Candidate" })
    expect(
      authRedirect(at("/employer/dashboard"), { roles: ["Employer"] })
    ).toBe("/employee/jobs")
  })

  it("holds employers on onboarding until their profile is complete", () => {
    signIn({ role: "Employer", is_profile_completed: false })
    expect(authRedirect(at("/employer/jobs"))).toBe("/employer/onboarding")
    expect(authRedirect(at("/employer/onboarding"))).toBeNull()

    signIn({ role: "Employer", is_profile_completed: true })
    expect(authRedirect(at("/employer/onboarding"))).toBe("/employer/dashboard")
    expect(guestRedirect()).toBe("/employer/dashboard")
  })

  it("only follows same-site next paths", () => {
    expect(safeNext("/employer/billing?checkout=pro")).toBe(
      "/employer/billing?checkout=pro"
    )
    for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", null]) {
      expect(safeNext(bad)).toBeNull()
    }
  })
})

describe("session store", () => {
  it("treats a malformed or role-less record as signed out", () => {
    localStorage.setItem("user", "{not json")
    expect(readSession().status).toBe("guest")
    localStorage.setItem("user", JSON.stringify({ email: "a@b.in" }))
    expect(readSession().status).toBe("guest")
  })

  it("hears a sign-out from another tab", () => {
    signIn()
    const listener = vi.fn()
    const stop = subscribe(listener)

    localStorage.clear()
    window.dispatchEvent(new StorageEvent("storage", { key: null }))
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }))

    expect(listener).toHaveBeenCalledOnce()
    expect(readSession().status).toBe("guest")
    stop()
  })
})
