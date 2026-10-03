export class ApiError extends Error {
  override name = "ApiError"
}

export class NetworkError extends ApiError {
  override name = "NetworkError"
}

export class TimeoutError extends ApiError {
  override name = "TimeoutError"
}

export class HttpError extends ApiError {
  override name = "HttpError"
  readonly status: number
  readonly code: string | undefined
  /** The backend's own message, when it sent one. Not always fit to show users. */
  readonly backendMessage: string | undefined

  constructor(status: number, body?: unknown) {
    const { code, message } = readErrorBody(body)
    super(`HTTP ${status}${message ? `: ${message}` : ""}`)
    this.status = status
    this.code = code
    this.backendMessage = message
  }
}

export class ResponseShapeError extends ApiError {
  override name = "ResponseShapeError"
}

function readErrorBody(body: unknown): { code?: string; message?: string } {
  if (typeof body !== "object" || body === null) return {}
  const record = body as Record<string, unknown>
  const text = (key: string) =>
    typeof record[key] === "string" ? record[key] : undefined
  return {
    code: text("code") ?? text("error_code"),
    message: text("message") ?? text("detail") ?? text("error"),
  }
}
