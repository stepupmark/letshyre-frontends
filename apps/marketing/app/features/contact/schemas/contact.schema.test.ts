import { describe, expect, it } from "vitest"

import { makeContactSchema } from "./contact.schema"

const schema = makeContactSchema((key) => key)

const valid = {
  name: "Ada",
  email: "ada@example.com",
  subject: "Hiring",
  message: "I would like to know more about your platform.",
}

const messageFor = (field: keyof typeof valid, value: string) =>
  schema
    .safeParse({ ...valid, [field]: value })
    .error?.issues.find((issue) => issue.path[0] === field)?.message

describe("makeContactSchema", () => {
  it("accepts a filled form and trims it", () => {
    expect(schema.parse({ ...valid, name: "  Ada  " }).name).toBe("Ada")
  })

  it.each([
    ["name", "A", "form.validation.nameMin"],
    ["email", "not-an-email", "form.validation.emailInvalid"],
    ["subject", "Hi", "form.validation.subjectMin"],
    ["message", "Too short", "form.validation.messageMin"],
    ["message", "x".repeat(1001), "form.validation.messageMax"],
  ] as const)("rejects %s with its own message", (field, value, key) => {
    expect(messageFor(field, value)).toBe(key)
  })

  it("treats whitespace-only text as empty", () => {
    expect(messageFor("name", "     ")).toBe("form.validation.nameMin")
    expect(messageFor("email", "   ")).toBe("form.validation.emailInvalid")
  })
})
