import { z } from "zod"

import { dataOf } from "@/lib/response"

const memberSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  full_name: z.string().nullish(),
  email: z.string().nullish(),
  title: z.string().nullish(),
  status: z.string().nullish(),
})

export type Member = z.infer<typeof memberSchema>

export const membersSchema = z.preprocess(
  (json) => {
    const data = dataOf(json)
    return Array.isArray(data) ? { results: data } : data
  },
  z.looseObject({
    // one malformed row shouldn't make the team look empty
    results: z
      .array(z.unknown())
      .catch([])
      .transform((rows) =>
        rows.flatMap((row) => {
          const parsed = memberSchema.safeParse(row)
          return parsed.success ? [parsed.data] : []
        })
      ),
  })
)
