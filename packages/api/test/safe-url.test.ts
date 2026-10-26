import { expect, it } from "vitest"

import { safeUrl } from "../src/safe-url.ts"

it("passes http(s) URLs through, normalised", () => {
  expect(safeUrl("https://cdn.letshyre.ai/a b.png")).toBe(
    "https://cdn.letshyre.ai/a%20b.png"
  )
  expect(safeUrl(" http://acme.com ")).toBe("http://acme.com/")
})

it("blocks every other scheme and anything unparseable", () => {
  for (const bad of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>",
    "vbscript:x",
    "ftp://acme.com",
    "acme.com",
    "/relative/path",
    "",
    "   ",
    null,
    undefined,
  ]) {
    expect(safeUrl(bad)).toBeNull()
  }
})

it("reads a bare domain as https only when asked", () => {
  expect(safeUrl("acme.com/jobs", { bareDomains: true })).toBe(
    "https://acme.com/jobs"
  )
  expect(safeUrl("javascript:alert(1)", { bareDomains: true })).toBeNull()
})
