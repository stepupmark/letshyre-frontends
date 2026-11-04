import { DEFAULT_LOCALE, localePath } from "@workspace/i18n"

import type { PageId } from "../app/lib/pages.ts"

// "Optional" is the llms.txt name for links a reader with little context can skip
type Section = "Employers" | "Professionals" | "Company" | "Optional"

// typed over every page, so a new page has to be placed or left out on purpose
const LLMS_SECTIONS: Record<PageId, Section | null> = {
  home: null,
  homeV2: null,
  employers: "Employers",
  pricing: "Employers",
  employerGuide: "Employers",
  candidates: "Professionals",
  candidateGuide: "Professionals",
  interview: "Professionals",
  download: "Professionals",
  about: "Company",
  contact: "Company",
  terms: "Optional",
  privacy: "Optional",
  refund: "Optional",
}

const ORDER: Section[] = ["Employers", "Professionals", "Company", "Optional"]

export interface LlmsPage {
  id: PageId
  path: string
  title: string
  description: string
}

const TITLE_SUFFIX = / \| letshyre\.ai$/

/** llms.txt (llmstxt.org): the English pages, grouped, with what each one answers. */
export function renderLlms(
  site: string,
  { name, summary }: { name: string; summary: string },
  pages: LlmsPage[]
): string {
  const line = (page: LlmsPage) =>
    `- [${page.title.replace(TITLE_SUFFIX, "")}](${site}${localePath(DEFAULT_LOCALE, page.path)}): ${page.description}`

  const sections = ORDER.flatMap((section) => {
    const links = pages.filter((page) => LLMS_SECTIONS[page.id] === section)
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
