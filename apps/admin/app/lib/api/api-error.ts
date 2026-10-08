import { HttpError, NetworkError, TimeoutError } from "@workspace/api"
import axios from "axios"

const FALLBACK_MESSAGE = "Something went wrong. Please try again."
const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again."
const NON_FIELD_KEYS = new Set([
  "message",
  "detail",
  "success",
  "status",
  "data",
  "errors",
])

export class ApiError extends Error {
  readonly status: number | null
  readonly fieldErrors: Record<string, string[]>

  constructor(
    message: string,
    status: number | null = null,
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// DRF nests messages in arrays and objects, e.g. { message: { code: ["Already exists"] } }
function firstString(value: unknown, depth = 0): string | undefined {
  if (typeof value === "string") return value.trim() || undefined
  if (depth > 3 || !value || typeof value !== "object") return undefined
  for (const item of Array.isArray(value) ? value : Object.values(value)) {
    const found = firstString(item, depth + 1)
    if (found) return found
  }
  return undefined
}

function readFieldErrors(
  body: Record<string, unknown>
): Record<string, string[]> {
  const source =
    body.errors &&
    typeof body.errors === "object" &&
    !Array.isArray(body.errors)
      ? (body.errors as Record<string, unknown>)
      : body
  const result: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(source)) {
    if (source === body && NON_FIELD_KEYS.has(key)) continue
    const messages = (Array.isArray(value) ? value : [value]).filter(
      (item): item is string => typeof item === "string" && item.trim() !== ""
    )
    if (messages.length) result[key] = messages
  }
  return result
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null
    const data: unknown = error.response?.data
    const body =
      data && typeof data === "object" ? (data as Record<string, unknown>) : {}
    const nested =
      body.data && typeof body.data === "object"
        ? (body.data as Record<string, unknown>)
        : {}
    const fieldErrors = readFieldErrors(body)

    const message =
      firstString(body.message) ??
      firstString(body.detail) ??
      firstString(nested.message) ??
      Object.values(fieldErrors)[0]?.[0] ??
      firstString(nested) ??
      (typeof data === "string" && data.length < 200
        ? firstString(data)
        : undefined) ??
      (status === null ? NETWORK_MESSAGE : FALLBACK_MESSAGE)

    return new ApiError(message, status, fieldErrors)
  }

  if (error instanceof Error)
    return new ApiError(error.message || FALLBACK_MESSAGE)
  return new ApiError(FALLBACK_MESSAGE)
}

export function getErrorMessage(
  error: unknown,
  fallback = FALLBACK_MESSAGE
): string {
  if (error instanceof HttpError) return error.backendMessage ?? fallback
  if (error instanceof NetworkError || error instanceof TimeoutError)
    return NETWORK_MESSAGE
  return error instanceof Error && error.message ? error.message : fallback
}
