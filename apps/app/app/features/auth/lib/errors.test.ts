import { HttpError } from "@workspace/api"
import { describe, expect, it } from "vitest"

import { authErrorKey, FIELD_OF } from "./errors"

const refusal = (message: string) =>
  authErrorKey(new HttpError(400, { message }), "errors.sendFailed")

describe("authErrorKey on registration refusals", () => {
  it("maps the backend's exact messages to email-field errors", () => {
    const taken = refusal("An account with this email already exists.")
    const personal = refusal(
      "Employer registration requires a company domain email address."
    )

    expect(taken).toBe("errors.emailExists")
    expect(personal).toBe("errors.companyEmailRequired")
    expect(FIELD_OF[taken]).toBe("email")
    expect(FIELD_OF[personal]).toBe("email")
  })

  it("still recognises them when the backend rewords them", () => {
    expect(refusal("This email is already registered")).toBe(
      "errors.emailExists"
    )
    expect(
      refusal("Please use a company email to sign up as an employer")
    ).toBe("errors.companyEmailRequired")
  })

  it("falls back to the generic send error for anything else", () => {
    expect(refusal("Something unexpected")).toBe("errors.sendFailed")
  })
})
