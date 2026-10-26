import { expect, it } from "vitest"

import { toCsv } from "./csv"

it("neutralises cells a spreadsheet would run as formulas", () => {
  const csv = toCsv([
    ['=HYPERLINK("http://x")', "+1", "-2", "@SUM(A1)", "\tTab", "\rCR"],
  ])
  expect(csv).toBe(
    String.raw`"'=HYPERLINK(""http://x"")",'+1,'-2,'@SUM(A1),'` +
      "\tTab," +
      `"'\rCR"`
  )
})

it("keeps negative numbers as numbers", () => {
  expect(toCsv([[-250, 0, 1.5]])).toBe("-250,0,1.5")
})

it("quotes commas, quotes and newlines, and leaves empty cells blank", () => {
  expect(
    toCsv([
      ["Rao, Asha", 'say "hi"', "two\nlines"],
      [null, undefined, true],
    ])
  ).toBe('"Rao, Asha","say ""hi""","two\nlines"\r\n,,true')
})
