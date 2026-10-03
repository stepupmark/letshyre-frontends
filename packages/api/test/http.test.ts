import { delay, http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import {
  HttpError,
  NetworkError,
  ResponseShapeError,
  TimeoutError,
} from "../src/errors.ts"
import { client, server, url } from "./server.ts"

describe("createHttpClient", () => {
  it("joins the base url, drops empty query values and sends JSON", async () => {
    let seen: Request | undefined
    server.use(
      http.post(url("v1/things/"), ({ request }) => {
        seen = request
        return HttpResponse.json({ ok: true })
      })
    )

    const result = await client({ baseUrl: "https://api.test" }).post(
      "/v1/things/",
      { a: 1 },
      { query: { page: 2, q: undefined, all: false } }
    )

    expect(result).toEqual({ ok: true })
    expect(seen?.url).toBe(url("v1/things/?page=2&all=false"))
    expect(seen?.headers.get("content-type")).toBe("application/json")
    expect(await seen?.json()).toEqual({ a: 1 })
  })

  it("adds the auth header only when one is provided", async () => {
    const auth: (string | null)[] = []
    server.use(
      http.get(url("me/"), ({ request }) => {
        auth.push(request.headers.get("authorization"))
        return HttpResponse.json({})
      })
    )

    await client().get("/me/")
    await client({ getAuthHeader: () => "Bearer t" }).get("/me/")
    expect(auth).toEqual([null, "Bearer t"])
  })

  it("returns null for an empty body", async () => {
    server.use(
      http.post(url("empty/"), () => new HttpResponse(null, { status: 204 }))
    )
    expect(await client().post("/empty/")).toBeNull()
  })

  it("turns error responses into HttpError with the backend's message", async () => {
    server.use(
      http.post(url("bad/"), () =>
        HttpResponse.json(
          { code: "invalid", message: "Email is invalid" },
          { status: 400 }
        )
      )
    )

    const error = await client()
      .post("/bad/")
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({
      status: 400,
      code: "invalid",
      backendMessage: "Email is invalid",
    })
  })

  it("keeps the status when the error body isn't JSON", async () => {
    server.use(
      http.get(url("html/"), () =>
        HttpResponse.text("<h1>502</h1>", { status: 418 })
      )
    )
    await expect(client().get("/html/")).rejects.toMatchObject({
      status: 418,
      backendMessage: undefined,
    })
  })

  it("calls onUnauthorized on a 401", async () => {
    const onUnauthorized = vi.fn()
    server.use(
      http.get(url("me/"), () =>
        HttpResponse.json({ detail: "expired" }, { status: 401 })
      )
    )

    await expect(client({ onUnauthorized }).get("/me/")).rejects.toBeInstanceOf(
      HttpError
    )
    expect(onUnauthorized).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 })
    )
  })

  it("retries GETs on 5xx and gives up after the last attempt", async () => {
    let calls = 0
    server.use(
      http.get(url("flaky/"), () => {
        calls++
        return calls < 3
          ? HttpResponse.json({}, { status: 503 })
          : HttpResponse.json({ ok: calls })
      })
    )
    expect(await client().get("/flaky/")).toEqual({ ok: 3 })

    calls = 0
    server.use(
      http.get(
        url("down/"),
        () => (calls++, HttpResponse.json({}, { status: 500 }))
      )
    )
    await expect(client({ retries: 1 }).get("/down/")).rejects.toMatchObject({
      status: 500,
    })
    expect(calls).toBe(2)
  })

  it("never retries POSTs or client errors", async () => {
    let calls = 0
    server.use(
      http.post(
        url("once/"),
        () => (calls++, HttpResponse.json({}, { status: 503 }))
      ),
      http.get(
        url("missing/"),
        () => (calls++, HttpResponse.json({}, { status: 404 }))
      )
    )
    await expect(client().post("/once/")).rejects.toBeInstanceOf(HttpError)
    await expect(client().get("/missing/")).rejects.toBeInstanceOf(HttpError)
    expect(calls).toBe(2)
  })

  it("waits between retries with the default backoff", async () => {
    vi.useFakeTimers()
    let calls = 0
    server.use(
      http.get(url("slow-retry/"), () => (calls++, HttpResponse.error()))
    )

    const pending = client({ retryDelayMs: undefined, retries: 1 })
      .get("/slow-retry/")
      .catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(299)
    expect(calls).toBe(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(await pending).toBeInstanceOf(NetworkError)
    expect(calls).toBe(2)
    vi.useRealTimers()
  })

  it("reports network failures and timeouts as their own errors", async () => {
    server.use(
      http.get(url("offline/"), () => HttpResponse.error()),
      http.get(url("hang/"), async () => {
        await delay(200)
        return HttpResponse.json({})
      })
    )
    await expect(
      client({ retries: 0 }).get("/offline/")
    ).rejects.toBeInstanceOf(NetworkError)
    await expect(
      client({ retries: 0, timeoutMs: 20 }).get("/hang/")
    ).rejects.toBeInstanceOf(TimeoutError)
  })

  it("rethrows the caller's abort without retrying", async () => {
    let calls = 0
    server.use(
      http.get(url("hang/"), async () => {
        calls++
        await delay(200)
        return HttpResponse.json({})
      })
    )
    const controller = new AbortController()
    const pending = client().get("/hang/", { signal: controller.signal })
    setTimeout(() => {
      controller.abort(new Error("left the page"))
    }, 10)
    await expect(pending).rejects.toThrow("left the page")
    expect(calls).toBe(1)
  })

  it("stops waiting for a retry when the caller aborts", async () => {
    server.use(http.get(url("offline/"), () => HttpResponse.error()))
    const controller = new AbortController()
    const pending = client({ retryDelayMs: () => 1_000 }).get("/offline/", {
      signal: controller.signal,
    })
    setTimeout(() => {
      controller.abort(new Error("cancelled"))
    }, 20)
    await expect(pending).rejects.toThrow("cancelled")
  })

  it("rejects a success response that isn't JSON", async () => {
    server.use(http.get(url("html/"), () => HttpResponse.text("<html>")))
    await expect(client().get("/html/")).rejects.toBeInstanceOf(
      ResponseShapeError
    )
  })
})
