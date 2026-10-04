import { readFileSync } from "node:fs"

import { expect, test } from "vitest"
import type { z } from "zod"

import { creditsSchema } from "./credits"
import { dataOf } from "./response"

// every schema the app parses responses with, against its fixture in e2e/api
const CONTRACTS: Record<string, z.ZodType> = {
  "payment.v1.employer_credits": creditsSchema,
}

const fixture = (name: string): unknown =>
  JSON.parse(
    readFileSync(new URL(`../../e2e/api/${name}.json`, import.meta.url), "utf8")
  )

test.each(Object.entries(CONTRACTS))(
  "%s matches what the app expects",
  (name, schema) => {
    expect(() => schema.parse(dataOf(fixture(name)))).not.toThrow()
  }
)
