import { describe, expect, test } from "vitest"

import { addRecipients, notQueued, parseRecipients } from "./recipients"

describe("parseRecipients", () => {
  test("reads the formats people paste", () => {
    const { found, invalid } = parseRecipients(
      [
        "Jane Doe <jane@acme.com>",
        '"Smith, John" <john@acme.com>',
        "priya@acme.com, Priya Raman",
        "Wei Chen;wei@acme.com",
        "alex.morgan@acme.com",
      ].join("\n")
    )
    expect(found).toEqual([
      { email: "jane@acme.com", name: "Jane Doe" },
      { email: "john@acme.com", name: "Smith, John" },
      { email: "priya@acme.com", name: "Priya Raman" },
      { email: "wei@acme.com", name: "Wei Chen" },
      { email: "alex.morgan@acme.com", name: "Alex Morgan" },
    ])
    expect(invalid).toEqual([])
  })

  test("splits a line of several addresses and skips a CSV header", () => {
    const { found, invalid } = parseRecipients(
      "name,email\na@acme.com, b@acme.com; c@acme.com"
    )
    expect(found.map((r) => r.email)).toEqual([
      "a@acme.com",
      "b@acme.com",
      "c@acme.com",
    ])
    expect(invalid).toEqual([])
  })

  test("reports what isn't an address instead of guessing", () => {
    const { found, invalid } = parseRecipients("jane@acme\nJohn <john@>\nhello")
    expect(found).toEqual([])
    expect(invalid).toEqual(["jane@acme", "John <john@>", "hello"])
  })
})

test("the same address in another case is added once", () => {
  const result = addRecipients(
    [{ email: "Jane@Acme.com", name: "Jane" }],
    [
      { email: "jane@acme.com", name: "Jane again" },
      { email: "bo@acme.com", name: "Bo" },
      { email: "BO@acme.com", name: "Bo" },
    ]
  )
  expect(result.list.map((r) => r.email)).toEqual([
    "Jane@Acme.com",
    "bo@acme.com",
  ])
  expect(result.duplicates).toBe(2)
})

test("anyone the API didn't queue is reported as not sent", () => {
  const sent = [
    { email: "Jane@acme.com", name: "Jane" },
    { email: "bo@acme.com", name: "Bo" },
  ]
  expect(notQueued(sent, ["jane@acme.com"])).toEqual([sent[1]])
})
