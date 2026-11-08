import { compile } from "@mdx-js/mdx"
import { describe, expect, it } from "vitest"

import { remarkGuard } from "./remark-guard"

const build = (mdx: string) => compile(mdx, { remarkPlugins: [remarkGuard] })

describe("remarkGuard", () => {
  it("accepts markdown, the component set and local image imports", async () => {
    await expect(
      build(`import chart from "./chart.svg"

## Heading

<Callout tone="tip">A tip with **bold** text.</Callout>

<Figure src={chart} alt="A chart" width={720} height={400} />
`)
    ).resolves.toBeDefined()
  })

  it.each([
    ["raw HTML", `<div>hi</div>`, /<div> isn't in the blog's component set/],
    ["unknown component", `<Chart />`, /component set/],
    ["package import", `import x from "react"`, /local images/],
    ["exports", `export const x = 1`, /local images/],
    ["code", `{1 + 1}`, /can't run code/],
    ["markdown image", `![chart](./chart.svg)`, /Markdown image/],
    [
      "figure without alt",
      `<Figure src="/a.svg" alt="" width={1} height={1} />`,
      /alt text/,
    ],
    [
      "figure without size",
      `<Figure src="/a.svg" alt="A chart" />`,
      /width and height/,
    ],
  ])("fails the build on %s", async (_, mdx, reason) => {
    await expect(build(mdx)).rejects.toThrow(reason)
  })
})
