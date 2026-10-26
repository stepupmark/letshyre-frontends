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
  /** DRF field errors as { field: "first message" }, for forms. */
  readonly fieldErrors: Record<string, string> | undefined
  /** From the Retry-After header on a 429 or 503. */
  readonly retryAfterMs: number | undefined

  constructor(status: number, body?: unknown, retryAfterMs?: number) {
    const { code, message } = readErrorBody(body)
    super(`HTTP ${status}${message ? `: ${message}` : ""}`)
    this.status = status
    this.code = code
    this.backendMessage = message
    this.fieldErrors = fieldErrorsOf(body)
    this.retryAfterMs = retryAfterMs
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

// DRF sends { field: ["msg"] }, at the top level or under errors/data;
// custom serializers sometimes send a bare string
function fieldErrorsOf(body: unknown): Record<string, string> | undefined {
  if (!isRecord(body)) return undefined
  const source = [body.errors, body.data].find(isRecord) ?? body
  const errors: Record<string, string> = {}
  for (const [field, value] of Object.entries(source)) {
    if (
      ["code", "error_code", "message", "detail", "error", "success"].includes(
        field
      )
    )
      continue
    const first: unknown = Array.isArray(value) ? value[0] : value
    if (typeof first === "string") errors[field] = first
  }
  return Object.keys(errors).length > 0 ? errors : undefined
}
