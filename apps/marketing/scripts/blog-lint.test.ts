import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

import { TOPICS } from "../app/lib/blog/list"
import { AUDIENCES } from "../app/lib/blog/post"
import {
  CALLOUT_TONES,
  FEATURE_AUDIENCES,
  TOOLS,
} from "../app/lib/blog/remark-guard"
import { type LintContext, lintPost, TEMPLATE_DESCRIPTION } from "./blog-lint"

it("offers the same choices in the editor snippets as the build accepts", () => {
  // vitest runs from apps/marketing
  const snippets = readFileSync(
    resolve("../../.vscode/blog.code-snippets"),
    "utf8"
  )
  const choices = [...snippets.matchAll(/\$\{\d+\|([^|]+)\|\}/g)].map(
    (m) => m[1]
  )
  expect(choices).toEqual([
    AUDIENCES.join(","),
    TOPICS.join(","),
    CALLOUT_TONES.join(","),
    FEATURE_AUDIENCES.join(","),
    TOOLS.join(","),
  ])
})

const FILE = "/content/blog/structured/en.mdx"
const description =
  "How to run a structured interview, from the questions to the debrief, in one afternoon."

const post = (body: string, desc = description) =>
  `---
title: Structured interviews
description: ${desc}
publishedAt: 2026-11-08
audience: employers
topic: interviewing
---

${body}
`

const ctx: LintContext = {
  paths: new Set(["/en/employers"]),
  image: () => ({ width: 720, height: 400, bytes: 1000 }),
  has: () => true,
}

const lint = async (source: string) =>
  (await lintPost(FILE, source, ctx)).map(
    (issue) => `${issue.level}:${issue.line ?? "-"}:${issue.message}`
  )

describe("lintPost", () => {
  it("passes a post that follows the guide", async () => {
    const body = `import chart from "./chart.svg"

{/* a note for the reviewer */}

## Ask every candidate the same questions

See [what we offer](/en/employers).

<Figure src={chart} alt="Scores from four interviewers side by side" width={720} height={400} />`
    expect(await lint(post(body))).toEqual([])
  })

  it("catches what the build lets through", async () => {
    const body = `import chart from "./chart.svg"

# A second title

## Section

#### Too deep

A [broken link](/en/nowhere) about Letshyre.

<Figure src={chart} alt="chart.svg" width={400} height={400} />

Teams that [ask every candidate the same questions](/en/employers) in the same order and score each answer against the same short rubric before they talk to each other end up with notes they can actually compare when they sit down to decide who gets the offer.

Speed isn't the goal. It's the waiting, and silence isn't neutral. It's a signal.`
    const issues = await lint(post(body, TEMPLATE_DESCRIPTION))
    expect(issues).toEqual([
      "error:-:description is still the template's; write the post's own",
      expect.stringMatching(/^error:11:.*only #/),
      expect.stringMatching(/^error:15:.*don't skip a level/),
      expect.stringMatching(/^error:17:\/en\/nowhere isn't a page/),
      expect.stringMatching(/^error:19:alt "chart.svg"/),
      expect.stringMatching(/^error:19:width and height \(400 × 400\)/),
      expect.stringMatching(/^warning:17:write "LetsHyre"/),
      expect.stringMatching(/^warning:21:a 45-word sentence/),
      expect.stringMatching(
        /^suggestion:23:the "isn.t X. It.s Y" turn 2 times/
      ),
    ])
  })

  it("suggests glossary terms, tagged posts it doesn't link yet, and tags one post short of a page", async () => {
    const source = post(
      "Your CTC isn't your take-home. ATSes read it too. See [the gap post](/en/blogs/gap).",
      description
    ).replace(
      "topic: interviewing",
      "topic: interviewing\ntags: [salary, resumes]"
    )
    const issues = await lintPost(FILE, source, {
      ...ctx,
      paths: new Set(["/en/blogs/gap"]),
      terms: [
        { id: "ctc", names: ["CTC", "cost to company"] },
        { id: "ats", names: ["ATS"] },
      ],
      posts: [
        { path: "/en/blogs/gap", title: "Gap", tags: ["resumes"] },
        { path: "/en/blogs/offer", title: "Offer", tags: ["salary"] },
        { path: "/en/blogs/other", title: "Other", tags: ["ai"] },
      ],
    })
    expect(
      issues.filter((i) => i.level === "suggestion").map((i) => i.message)
    ).toEqual([
      expect.stringContaining('<Term id="ctc">'),
      expect.stringContaining("(/en/blogs/offer)"),
      "salary has 2 posts; one more gives it a page",
      "resumes has 2 posts; one more gives it a page",
    ])
  })
})
