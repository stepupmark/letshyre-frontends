import { readFileSync } from "node:fs"

import { expect, test } from "vitest"
import type { z } from "zod"

import { sharedScorecardSchema } from "@/features/shared-scorecard/schema"
import { creditsSchema } from "@/lib/credits"
import { dataOf } from "@/lib/response"

// every schema the app parses responses with, against its fixture in e2e/api
const CONTRACTS: Record<string, z.ZodType> = {
  "payment.v1.employer_credits": creditsSchema,
  "user.v1.public.shared-candidate": sharedScorecardSchema,
}

const fixture = (name: string): unknown =>
  JSON.parse(
    readFileSync(new URL(`../e2e/api/${name}.json`, import.meta.url), "utf8")
  )

test.each(Object.entries(CONTRACTS))(
  "%s matches what the app expects",
  (name, schema) => {
    expect(() => schema.parse(dataOf(fixture(name)))).not.toThrow()
  }
)
