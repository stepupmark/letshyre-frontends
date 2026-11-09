import { DEFAULT_LOCALE, localePath } from "@workspace/i18n"

import type { PageId } from "../app/lib/pages.ts"

// "Optional" is the llms.txt name for links a reader with little context can skip
type Section = "Employers" | "Professionals" | "Company" | "Blogs" | "Optional"

// typed over every page, so a new page has to be placed or left out on purpose
const LLMS_SECTIONS: Record<PageId, Section | null> = {
  home: null,
  homeV2: null,
  homeV3: null,
  employers: "Employers",
  pricing: "Employers",
  employerGuide: "Employers",
  candidates: "Professionals",
  candidateGuide: "Professionals",
  interview: "Professionals",
  download: "Professionals",
  about: "Company",
  contact: "Company",
  blog: "Blogs",
  terms: "Optional",
  privacy: "Optional",
  refund: "Optional",
}

const ORDER: Section[] = [
  "Employers",
  "Professionals",
  "Company",
  "Blogs",
  "Optional",
]

interface Link {
  path: string
  title: string
  description: string
}

export interface LlmsPage extends Link {
  id: PageId
}

const TITLE_SUFFIX = / \| letshyre\.ai$/

/** llms.txt (llmstxt.org): the English pages and posts, grouped, with what each one answers. */
export function renderLlms(
  site: string,
  { name, summary }: { name: string; summary: string },
  pages: LlmsPage[],
  posts: Link[] = []
): string {
  const line = (page: Link) =>
    `- [${page.title.replace(TITLE_SUFFIX, "")}](${site}${localePath(DEFAULT_LOCALE, page.path)}): ${page.description}`

  const sections = ORDER.flatMap((section) => {
    const links: Link[] = [
      ...pages.filter((page) => LLMS_SECTIONS[page.id] === section),
      ...(section === "Blogs" ? posts : []),
    ]
    return links.length
      ? [`## ${section}\n\n${links.map(line).join("\n")}`]
      : []
  })

  return `# ${name}

> ${summary}

Pages are in English at ${site}/en; translated pages list their languages with hreflang.

${sections.join("\n\n")}
`
}
