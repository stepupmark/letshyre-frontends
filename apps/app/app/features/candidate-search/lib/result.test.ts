import { describe, expect, it } from "vitest"

import { tidyPlace } from "./result"

describe("tidyPlace", () => {
  it("spaces commas and collapses runs of whitespace", () => {
    expect(tidyPlace("Kondapur,Hyderabad")).toBe("Kondapur, Hyderabad")
    expect(tidyPlace("Hyderabad ,  India")).toBe("Hyderabad, India")
    expect(tidyPlace("  New   Delhi ")).toBe("New Delhi")
  })

  it("drops stray commas at the ends", () => {
    expect(tidyPlace(",Pune,")).toBe("Pune")
  })

  it("returns null when nothing is left", () => {
    expect(tidyPlace(" , ")).toBeNull()
    expect(tidyPlace("")).toBeNull()
    expect(tidyPlace(null)).toBeNull()
  })
})
