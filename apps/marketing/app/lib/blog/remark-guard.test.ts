import { compile } from "@mdx-js/mdx"
import { describe, expect, it } from "vitest"

import { remarkGuard } from "./remark-guard"

const build = (mdx: string) => compile(mdx, { remarkPlugins: [remarkGuard] })

describe("remarkGuard", () => {
  it("accepts markdown, the component set, local imports, comments and Prettier's spacing", async () => {
    await expect(
      build(`import chart from "./chart.svg"

{/* a note for the reviewer */}

## Heading

<Callout tone="tip">
  A tip with **bold** text and a{" "}
  <Term id="ctc">CTC</Term>.
</Callout>

<Figure src={chart} alt="A chart" width={720} height={400} />
`)
    ).resolves.toBeDefined()
  })

  it.each([
    ["raw HTML", `<div>hi</div>`, /<div> isn't in the blog's component set/],
    ["package import", `import x from "react"`, /import files beside them/],
    ["code", `{1 + 1}`, /can't run code/],
    ["markdown image", `![chart](./chart.svg)`, /Markdown image/],
    [
      "figure without alt",
      `<Figure src="/a.svg" alt="" width={1} height={1} />`,
      /needs alt/,
    ],
    [
      "figure without size",
      `<Figure src="/a.svg" alt="A chart" />`,
      /needs width/,
    ],
    [
      "stat whose source isn't a link",
      `<Stat value="2x" label="Better" source="A study" cite="A study" />`,
      /https link/,
    ],
    [
      "video with a url for an id",
      `<VideoEmbed id="https://youtu.be/x" title="Demo" poster="/a.jpg" />`,
      /YouTube id/,
    ],
  ])("fails the build on %s", async (_, mdx, reason) => {
    await expect(build(mdx)).rejects.toThrow(reason)
  })
})
