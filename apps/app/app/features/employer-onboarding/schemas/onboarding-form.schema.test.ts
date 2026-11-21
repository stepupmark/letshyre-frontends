import { describe, expect, it } from "vitest"

import { makeSchema, stepSchema } from "./onboarding-form.schema"

// each message is its own key, so the test can tell which one fired
const schema = makeSchema(
  new Proxy({} as Parameters<typeof makeSchema>[0], {
    get: (_, key) => String(key),
  })
)
const legal = stepSchema(schema, "legal")

const messages = (values: Record<string, string>) => {
  const result = legal.safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues
      .toReversed()
      .map((issue) => [issue.path.join("."), issue.message])
  )
}

describe("onboarding legal step", () => {
  it("asks for a value when a field is empty, not for its format", () => {
    expect(
      messages({
        company_registration_number: "",
        pan_number: "",
        gst_number: "",
        address_line: "  ",
        address_city: "",
        address_state: "",
        address_pin: "",
      })
    ).toEqual({
      company_registration_number: "registrationRequired",
      pan_number: "panRequired",
      gst_number: "gstRequired",
      address_line: "addressRequired",
      address_city: "cityRequired",
      address_state: "stateRequired",
      address_pin: "pinRequired",
    })
  })

  it("explains the format once something is typed", () => {
    expect(
      messages({
        company_registration_number: "Stepupmark",
        pan_number: "ABCDE12345",
        gst_number: "36ABCDE1234F1X5",
        address_line: "12",
        address_city: "H",
        address_state: "T",
        address_pin: "50008",
      })
    ).toEqual({
      company_registration_number: "registration",
      pan_number: "pan",
      gst_number: "gst",
      address_line: "address",
      address_city: "city",
      address_state: "state",
      address_pin: "pin",
    })
  })
})
