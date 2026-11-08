import type { MDXComponents } from "mdx/types"

import type { MDX_COMPONENTS } from "@/lib/blog/remark-guard"

import { Callout } from "./callout"
import { Figure } from "./figure"
import { prose } from "./prose"

const kit: Record<(typeof MDX_COMPONENTS)[number], MDXComponents[string]> = {
  Callout,
  Figure,
}

export const mdxComponents: MDXComponents = { ...prose, ...kit }
