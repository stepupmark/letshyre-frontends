import { z } from "zod"

import { HttpError, ResponseShapeError } from "./errors.ts"

// skip zod's new Function() probe, which a CSP without unsafe-eval reports as a violation
z.config({ jitless: true })

const envelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
})

/** Reads `{ success, data, message }`. `success: false` becomes an HttpError even on a 200. */
function open(json: unknown) {
  const parsed = envelopeSchema.safeParse(json)
  if (!parsed.success)
    throw new ResponseShapeError("Response is not an API envelope", {
      cause: parsed.error,
    })
  if (!parsed.data.success) throw new HttpError(200, json)
  return parsed.data
}

export function unwrap<T extends z.ZodType>(schema: T) {
  return (json: unknown): z.output<T> => {
    const parsed = schema.safeParse(open(json).data)
    if (!parsed.success)
      throw new ResponseShapeError("Unexpected response data", {
        cause: parsed.error,
      })
    return parsed.data
  }
}

/**
 * For endpoints that send `{ success, data }` on some paths and the bare payload on others.
 * `success: false` still becomes an HttpError.
 */
export function payloadOf(json: unknown): unknown {
  if (typeof json !== "object" || json === null) return json
  if ("success" in json && json.success === false)
    throw new HttpError(200, json)
  return "data" in json ? json.data : json
}

/** For endpoints whose only useful output is the backend's message. */
export function acknowledge(json: unknown): { message: string | undefined } {
  return { message: open(json).message }
}

/** DRF page: `{ count, next, previous, results }`, plus `total_pages` on some endpoints. */
export const paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullish(),
    previous: z.string().nullish(),
    total_pages: z.number().optional(),
    results: z.array(item),
  })
