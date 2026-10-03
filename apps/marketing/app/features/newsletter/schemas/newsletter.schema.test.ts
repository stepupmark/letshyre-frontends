import { describe, expect, it } from "vitest"

import { isNewsletterError, newsletterSchema } from "./newsletter.schema"

const error = (email: string) =>
  newsletterSchema.safeParse({ email }).error?.issues[0]?.message

describe("newsletterSchema", () => {
  it("trims a valid email", () => {
    expect(newsletterSchema.parse({ email: "  a@b.co " })).toEqual({
      email: "a@b.co",
    })
  })

  it("returns catalog keys for empty and malformed input", () => {
    expect(error("  ")).toBe("newsletter.emailRequired")
    expect(error("not-an-email")).toBe("newsletter.emailInvalid")
    expect(isNewsletterError(error("x"))).toBe(true)
    expect(isNewsletterError("something else")).toBe(false)
  })
})
