import { describe, expect, it } from "vitest"

import { parseEnv } from "./env.schema"

const base = {
  VITE_SITE_URL: "https://beta.letshyre.ai",
  VITE_APP_URL: "https://app.letshyre.ai",
  VITE_API_BASE_URL: "https://api.letshyre.ai",
  VITE_META_PIXEL_ID: "1",
}

describe("VITE_INDEXABLE", () => {
  it("keeps a production build on a beta host out of search", () => {
    const env = parseEnv({
      ...base,
      VITE_ENV: "production",
      VITE_INDEXABLE: "false",
    })
    expect(env.VITE_INDEXABLE).toBe(false)
  })

  it("follows VITE_ENV when unset or empty", () => {
    expect(parseEnv({ ...base, VITE_ENV: "production" }).VITE_INDEXABLE).toBe(
      true
    )
    expect(
      parseEnv({ ...base, VITE_ENV: "production", VITE_INDEXABLE: "" })
        .VITE_INDEXABLE
    ).toBe(true)
    expect(parseEnv({ ...base, VITE_ENV: "staging" }).VITE_INDEXABLE).toBe(
      false
    )
  })

  it("refuses an indexable build outside production", () => {
    expect(() =>
      parseEnv({ ...base, VITE_ENV: "staging", VITE_INDEXABLE: "true" })
    ).toThrow(/only a production build can be indexable/)
  })
})
