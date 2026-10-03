import { z } from "zod"

import { HttpError, ResponseShapeError } from "./errors.ts"

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

/** For endpoints whose only useful output is the backend's message. */
export function acknowledge(json: unknown): { message: string | undefined } {
  return { message: open(json).message }
}
