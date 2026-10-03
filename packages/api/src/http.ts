import {
  HttpError,
  NetworkError,
  ResponseShapeError,
  TimeoutError,
} from "./errors.ts"

type Query = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions {
  query?: Query
  signal?: AbortSignal
  headers?: Record<string, string>
}

export interface HttpClientOptions {
  baseUrl: string
  timeoutMs?: number
  /** Extra attempts for GETs that fail on the network, time out, or get a 429/5xx. */
  retries?: number
  retryDelayMs?: (attempt: number) => number
  getAuthHeader?: () => string | null | undefined
  onUnauthorized?: (error: HttpError) => void
  fetch?: typeof fetch
}

export interface HttpClient {
  get: (path: string, options?: RequestOptions) => Promise<unknown>
  post: (
    path: string,
    body?: unknown,
    options?: RequestOptions
  ) => Promise<unknown>
}

const backoff = (attempt: number) => 300 * 2 ** attempt

export function createHttpClient({
  baseUrl,
  timeoutMs = 15_000,
  retries = 2,
  retryDelayMs = backoff,
  getAuthHeader,
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

  async function send(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions
  ) {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    }
    if (body !== undefined) headers["Content-Type"] = "application/json"
    const auth = getAuthHeader?.()
    if (auth) headers.Authorization = auth

    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeout])
      : timeout

    let response: Response
    try {
      response = await fetchImpl(url(path, options.query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
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

    const text = await response.text()
    let json: unknown = null
    if (text) {
      try {
        json = JSON.parse(text)
      } catch (error) {
        if (response.ok)
          throw new ResponseShapeError(
            `${method} ${path} returned invalid JSON`,
            { cause: error }
          )
      }
    }

    if (!response.ok) {
      const error = new HttpError(response.status, json)
      if (response.status === 401) onUnauthorized?.(error)
      throw error
    }
    return json
  }

  async function withRetry(path: string, options: RequestOptions) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await send("GET", path, undefined, options)
      } catch (error) {
        if (attempt >= retries || !isRetryable(error)) throw error
        await sleep(retryDelayMs(attempt), options.signal)
      }
    }
  }

  return {
    get: (path, options = {}) => withRetry(path, options),
    post: (path, body, options = {}) => send("POST", path, body, options),
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
