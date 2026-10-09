import { describe, expect, it } from "vitest"

import { pseudoLocalize } from "../src/pseudo.ts"

describe("pseudoLocalize", () => {
  it("accents letters, pads, and leaves placeholders and tags alone", () => {
    const out = pseudoLocalize("Hi {{name}}, read <b>this</b>")
    expect(out.startsWith("⟦Ĥí {{name}}, ŕéáð <b>ŧĥíš</b>")).toBe(true)
    expect(out.endsWith("·⟧")).toBe(true)
  })
})
