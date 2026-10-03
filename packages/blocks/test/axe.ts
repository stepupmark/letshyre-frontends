import axe from "axe-core"
import { expect } from "vitest"

// page-level rules don't apply to an isolated component
const PAGE_RULES = ["region", "landmark-one-main", "page-has-heading-one"]

export async function expectAccessible(container: Element = document.body) {
  const { violations } = await axe.run(container, {
    rules: Object.fromEntries(PAGE_RULES.map((id) => [id, { enabled: false }])),
  })
  expect(
    violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(", ")}`)
  ).toEqual([])
}
