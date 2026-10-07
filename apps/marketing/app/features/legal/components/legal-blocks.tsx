import { SITE } from "@/lib/seo/site"

import { type LegalBlock, subheadingId } from "../lib/legal-doc"
import { RichText } from "./rich-text"

export function LegalBlocks({
  sectionId,
  blocks,
}: {
  sectionId: string
  blocks: LegalBlock[]
}) {
  let subheadings = 0

  return blocks.map((block, index) => {
    const key = `${block.type}-${index}`
    switch (block.type) {
      case "p":
        return (
          <p key={key}>
            <RichText value={block.text} />
          </p>
        )
      case "subheading":
        return (
          <h3
            key={key}
            id={subheadingId(sectionId, subheadings++)}
            className="scroll-mt-24 pt-1 text-base font-semibold text-foreground"
          >
            {block.text}
          </h3>
        )
      case "ul":
        return (
          <ul
            key={key}
            className="flex list-disc flex-col gap-1.5 ps-5 marker:text-brand"
          >
            {block.items.map((item, i) => (
              <li key={i}>
                <RichText value={item} />
              </li>
            ))}
          </ul>
        )
      case "contact":
        return (
          <div key={key} className="flex flex-col gap-1">
            <p>{block.intro}</p>
            <p>
              {block.emailLabel}{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-primary underline underline-offset-4"
              >
                {SITE.email}
              </a>
            </p>
            <p>{block.team}</p>
          </div>
        )
    }
  })
}
