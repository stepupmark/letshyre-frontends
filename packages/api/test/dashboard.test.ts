import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import { errorKey } from "../src/error-key.ts"
import { HttpError, NetworkError } from "../src/errors.ts"
import { xhrUpload } from "../src/upload.ts"
import { client, server, url } from "./server.ts"

describe("401 refresh", () => {
  it("refreshes once and retries with the new token", async () => {
    let token = "old"
    const seen: (string | null)[] = []
    server.use(
      http.patch(url("me/"), ({ request }) => {
        seen.push(request.headers.get("authorization"))
        return request.headers.get("authorization") === "Bearer new"
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({}, { status: 401 })
      })
    )
    const refreshAuth = vi.fn(() => {
      token = "new"
      return Promise.resolve(true)
    })

    const result = await client({
      getAuthHeader: () => `Bearer ${token}`,
      refreshAuth,
    }).patch("/me/", { name: "A" })

    expect(result).toEqual({ ok: true })
    expect(seen).toEqual(["Bearer old", "Bearer new"])
    expect(refreshAuth).toHaveBeenCalledOnce()
  })

  it("gives up after one retry and reports the 401", async () => {
    server.use(
      http.get(url("me/"), () => HttpResponse.json({}, { status: 401 }))
    )
    const refreshAuth = vi.fn(() => Promise.resolve(true))
    const onUnauthorized = vi.fn()

    await expect(
      client({
        getAuthHeader: () => "Bearer t",
        refreshAuth,
        onUnauthorized,
      }).get("/me/")
    ).rejects.toBeInstanceOf(HttpError)
    expect(refreshAuth).toHaveBeenCalledOnce()
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it("sends public calls without a token and never refreshes them", async () => {
    let auth: string | null = "unset"
    server.use(
      http.post(url("login/"), ({ request }) => {
        auth = request.headers.get("authorization")
        return HttpResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        )
      })
    )
    const refreshAuth = vi.fn(() => Promise.resolve(true))
    const onUnauthorized = vi.fn()

    await expect(
      client({
        getAuthHeader: () => "Bearer t",
        refreshAuth,
        onUnauthorized,
      }).post("/login/", {}, { auth: false })
    ).rejects.toBeInstanceOf(HttpError)
    expect(auth).toBeNull()
    expect(refreshAuth).not.toHaveBeenCalled()
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

it("sends FormData as multipart, not JSON", async () => {
  let type = ""
  let file: FormDataEntryValue | null = null
  server.use(
    http.put(url("resume/"), async ({ request }) => {
      type = request.headers.get("content-type") ?? ""
      file = (await request.formData()).get("file")
      return HttpResponse.json({ id: 1 })
    })
  )
  const form = new FormData()
  form.append("file", new Blob(["pdf"]), "cv.pdf")

  expect(await client().put("/resume/", form)).toEqual({ id: 1 })
  expect(type).toMatch(/^multipart\/form-data; boundary=/)
  expect(file).toBeInstanceOf(File)
})

it("reads DRF field errors for forms, nested or not", () => {
  expect(
    new HttpError(400, { email: ["Enter a valid email."], detail: "x" })
      .fieldErrors
  ).toEqual({
    email: "Enter a valid email.",
  })
  expect(
    new HttpError(400, {
      success: false,
      message: "Invalid",
      data: { mobile: "Taken" },
    }).fieldErrors
  ).toEqual({ mobile: "Taken" })
})

describe("errorKey", () => {
  const rules = {
    messages: { "invalid credentials": "errors.invalidCredentials" },
    heuristics: [{ test: (m: string) => m.includes("otp"), key: "errors.otp" }],
    fallback: "errors.generic",
  }

  it("maps transport, rate-limit and server errors before reading the message", () => {
    expect(errorKey(new NetworkError("x"), rules)).toBe("errors.network")
    expect(
      errorKey(new HttpError(429, { message: "Invalid credentials" }), rules)
    ).toBe("errors.tooManyAttempts")
    expect(errorKey(new HttpError(502), rules)).toBe("errors.server")
  })

  it("prefers an exact message, then a heuristic, then the fallback", () => {
    expect(
      errorKey(new HttpError(400, { message: "Invalid Credentials!" }), rules)
    ).toBe("errors.invalidCredentials")
    expect(
      errorKey(new HttpError(400, { detail: "OTP has expired" }), rules)
    ).toBe("errors.otp")
    expect(errorKey(new HttpError(400, { message: "Nope" }), rules)).toBe(
      "errors.generic"
    )
  })
})

class FakeXhr {
  static last: FakeXhr
  upload: { onprogress: ((e: ProgressEvent) => void) | null } = {
    onprogress: null,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  status = 0
  responseText = ""
  headers: Record<string, string> = {}
  sent: unknown
  constructor() {
    FakeXhr.last = this
  }
  method = ""
  open(method: string) {
    this.method = method
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value
  }
  send(body: unknown) {
    this.sent = body
  }
  abort() {
    this.onabort?.()
  }
  progress(loaded: number, total: number) {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent)
  }
  respond(status: number, body: unknown) {
    this.status = status
    this.responseText = JSON.stringify(body)
    this.onload?.()
  }
}

describe("xhrUpload", () => {
  const createXhr = () => new FakeXhr() as unknown as XMLHttpRequest

  it("reports progress and resolves with the JSON body", async () => {
    const progress: number[] = []
    const done = xhrUpload(
      client({ getAuthHeader: () => "Bearer t" }),
      "/jd/",
      new FormData(),
      {
        createXhr,
        onProgress: (f) => progress.push(f),
      }
    )
    FakeXhr.last.progress(50, 100)
    FakeXhr.last.respond(200, { parsed: true })

    expect(await done).toEqual({ parsed: true })
    expect(progress).toEqual([0.5, 1])
    expect(FakeXhr.last.headers.Authorization).toBe("Bearer t")
  })

  it("rejects with the caller's reason when aborted", async () => {
    const controller = new AbortController()
    const done = xhrUpload(client(), "/jd/", new FormData(), {
      createXhr,
      signal: controller.signal,
    })
    controller.abort(new Error("left the page"))
    await expect(done).rejects.toThrow("left the page")
  })

  it("refreshes on a 401 and uploads again", async () => {
    const refreshAuth = vi.fn(() => Promise.resolve(true))
    const done = xhrUpload(client({ refreshAuth }), "/jd/", new FormData(), {
      createXhr,
    })
    const first = FakeXhr.last
    first.respond(401, {})
    await vi.waitFor(() => {
      expect(FakeXhr.last).not.toBe(first)
    })
    FakeXhr.last.respond(201, { id: 9 })

    expect(await done).toEqual({ id: 9 })
    expect(refreshAuth).toHaveBeenCalledOnce()
  })
})
