import { describe, expect, it } from "vitest"

import { isActive, NAV, type NavGroup, type NavItem } from "./nav"

const items = (Object.values(NAV) as NavGroup[][]).flatMap((groups) =>
  groups.flatMap((group) => group.items)
)
const activeAt = (pathname: string) =>
  items
    .filter((item) => isActive(item, pathname))
    .map((item: NavItem) => item.key)

describe("isActive", () => {
  it("marks only the most specific item", () => {
    expect(activeAt("/employer/jobs/new")).toEqual(["postJob"])
    expect(activeAt("/employer/jobs/101/applicants")).toEqual(["jobs"])
    expect(activeAt("/employer/candidates/unlocked")).toEqual(["unlocked"])
    expect(activeAt("/employer/find-candidates")).toEqual(["findCandidates"])
  })

  it("follows extra route patterns", () => {
    expect(activeAt("/employer/candidates/31")).toEqual(["unlocked"])
    expect(activeAt("/employer/billing")).toEqual(["billing"])
  })

  it("keeps the company profile active while editing it", () => {
    expect(activeAt("/employer/company/edit")).toEqual(["companyProfile"])
  })

  it("marks nothing on an unknown page", () => {
    expect(activeAt("/employer/nowhere")).toEqual([])
  })
})
