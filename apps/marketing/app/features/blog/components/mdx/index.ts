import type { MDXComponents } from "mdx/types"

import type { MDX_COMPONENTS } from "@/lib/blog/remark-guard"

import { Callout } from "./callout"
import { Compare } from "./compare"
import { Feature } from "./feature"
import { Figure } from "./figure"
import { prose } from "./prose"
import { Quote } from "./quote"
import { Stat } from "./stat"
import { Step, Steps } from "./steps"
import { VideoEmbed } from "./video-embed"

const kit: Record<(typeof MDX_COMPONENTS)[number], MDXComponents[string]> = {
  Callout,
  Compare,
  Feature,
  Figure,
  Quote,
  Stat,
  Step,
  Steps,
  VideoEmbed,
}

export const mdxComponents: MDXComponents = { ...prose, ...kit }
