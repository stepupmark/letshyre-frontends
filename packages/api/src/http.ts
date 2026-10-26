import {
  HttpError,
  NetworkError,
  ResponseShapeError,
  TimeoutError,
} from "./errors.ts"

export type Query = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions {
  query?: Query
  signal?: AbortSignal
  headers?: Record<string, string>
  /** false for endpoints that must go out without a token, e.g. login. */
  auth?: boolean
}

export interface HttpClientOptions {
  baseUrl: string
  timeoutMs?: number
  /** Extra attempts for GETs that fail on the network, time out, or get a 429/5xx. */
  retries?: number
  retryDelayMs?: (attempt: number) => number
  getAuthHeader?: () => string | null | undefined
  /** Called on a 401; resolve true once a new token is stored and the request is retried once. */
  refreshAuth?: () => Promise<boolean>
  onUnauthorized?: (error: HttpError) => void
  fetch?: typeof fetch
}

type Body = unknown

export interface HttpClient {
  get: (path: string, options?: RequestOptions) => Promise<unknown>
  post: (
    path: string,
    body?: Body,
    options?: RequestOptions
  ) => Promise<unknown>
  put: (path: string, body?: Body, options?: RequestOptions) => Promise<unknown>
  patch: (
    path: string,
    body?: Body,
    options?: RequestOptions
  ) => Promise<unknown>
  delete: (path: string, options?: RequestOptions) => Promise<unknown>
  getBlob: (path: string, options?: RequestOptions) => Promise<Blob>
  /** Builds the full URL and auth header, for callers that can't use fetch (uploads with progress). */
  prepare: (
    path: string,
    options?: RequestOptions
  ) => { url: URL; headers: Record<string, string> }
  /** Runs the 401 → refresh → retry-once flow around any request. */
  withAuthRetry: <T>(
    run: () => Promise<T>,
    options?: RequestOptions
  ) => Promise<T>
}

const backoff = (attempt: number) => 300 * 2 ** attempt

export function createHttpClient({
  baseUrl,
  timeoutMs = 15_000,
  retries = 2,
  retryDelayMs = backoff,
  getAuthHeader,
  refreshAuth,
  onUnauthorized,
  fetch: fetchImpl = (...args) => globalThis.fetch(...args),
}: HttpClientOptions): HttpClient {
  const root = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`

  function url(path: string, query: Query = {}) {
    const target = new URL(path.replace(/^\//, ""), root)
    for (const [key, value] of Object.entries(query)) {
      if (value != null) target.searchParams.set(key, String(value))
    }
    return target
  }

  function prepare(path: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    }
    const auth = options.auth === false ? undefined : getAuthHeader?.()
    if (auth) headers.Authorization = auth
    return { url: url(path, options.query), headers }
  }

  async function raw(
    method: string,
    path: string,
    body: Body,
    options: RequestOptions
  ) {
    const { url: target, headers } = prepare(path, options)
    // FormData sets its own multipart content type with the boundary
    const form = body instanceof FormData
    if (body !== undefined && !form)
      headers["Content-Type"] = "application/json"

    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeout])
      : timeout

    let response: Response
    try {
      response = await fetchImpl(target, {
        method,
        headers,
        body:
          body === undefined ? undefined : form ? body : JSON.stringify(body),
        signal,
      })
    } catch (error) {
      if (options.signal?.aborted) throw options.signal.reason
      if (timeout.aborted)
        throw new TimeoutError(
          `${method} ${path} timed out after ${timeoutMs}ms`
        )
      throw new NetworkError(`${method} ${path} failed`, { cause: error })
    }

    if (!response.ok)
      throw new HttpError(response.status, await readJson(response))
    return response
  }

  async function withAuthRetry<T>(
    run: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      return await run()
    } catch (error) {
      // a 401 on a request sent without a token is a wrong password, not an expired session
      if (
        !(error instanceof HttpError) ||
        error.status !== 401 ||
        options.auth === false
      )
        throw error
      if (!refreshAuth) {
        onUnauthorized?.(error)
        throw error
      }
      // false: no session to refresh, or refreshAuth has already ended it
      if (!(await refreshAuth())) throw error
      try {
        return await run()
      } catch (retryError) {
        if (retryError instanceof HttpError && retryError.status === 401)
          onUnauthorized?.(retryError)
        throw retryError
      }
    }
  }

  async function json(
    method: string,
    path: string,
    body: Body,
    options: RequestOptions
  ) {
    return withAuthRetry(async () => {
      const response = await raw(method, path, body, options)
      const text = await response.text()
      if (!text) return null
      try {
        return JSON.parse(text) as unknown
      } catch (error) {
        throw new ResponseShapeError(
          `${method} ${path} returned invalid JSON`,
          {
            cause: error,
          }
        )
      }
    }, options)
  }

  async function withRetry<T>(run: () => Promise<T>, options: RequestOptions) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await run()
      } catch (error) {
        if (attempt >= retries || !isRetryable(error)) throw error
        await sleep(retryDelayMs(attempt), options.signal)
      }
    }
  }

  return {
    get: (path, options = {}) =>
      withRetry(() => json("GET", path, undefined, options), options),
    post: (path, body, options = {}) => json("POST", path, body, options),
    put: (path, body, options = {}) => json("PUT", path, body, options),
    patch: (path, body, options = {}) => json("PATCH", path, body, options),
    delete: (path, options = {}) => json("DELETE", path, undefined, options),
    getBlob: (path, options = {}) =>
      withAuthRetry(
        async () => (await raw("GET", path, undefined, options)).blob(),
        options
      ),
    prepare,
    withAuthRetry,
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return JSON.parse(await response.text()) as unknown
  } catch {
    return null
  }
}

function isRetryable(error: unknown) {
  if (error instanceof NetworkError || error instanceof TimeoutError)
    return true
  return (
    error instanceof HttpError && (error.status === 429 || error.status >= 500)
  )
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason as Error)
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        reject(signal.reason as Error)
      },
      { once: true }
    )
  })
}
