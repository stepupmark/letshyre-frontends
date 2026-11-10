import type { MDXComponents } from "mdx/types"

import type { MDX_COMPONENTS } from "@/lib/blog/remark-guard"

import { Callout } from "./callout"
import { Check, Checklist } from "./checklist"
import { Compare } from "./compare"
import { Download } from "./download"
import { Faq, Question } from "./faq"
import { Feature } from "./feature"
import { Figure } from "./figure"
import { prose } from "./prose"
import { Quote } from "./quote"
import { Stat } from "./stat"
import { Step, Steps } from "./steps"
import { Term } from "./term"
import { Tool } from "./tool"
import { VideoEmbed } from "./video-embed"

const kit: Record<(typeof MDX_COMPONENTS)[number], MDXComponents[string]> = {
  Callout,
  Check,
  Checklist,
  Compare,
  Download,
  Faq,
  Feature,
  Figure,
  Question,
  Quote,
  Stat,
  Step,
  Steps,
  Term,
  Tool,
  VideoEmbed,
}

export const mdxComponents: MDXComponents = { ...prose, ...kit }
