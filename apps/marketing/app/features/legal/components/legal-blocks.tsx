import { SITE } from "@/lib/seo/site"

import { type LegalBlock, subheadingIds } from "../lib/legal-doc"
import { RichText } from "./rich-text"

export function LegalBlocks({
  sectionId,
  blocks,
}: {
  sectionId: string
  blocks: LegalBlock[]
}) {
  const ids = subheadingIds(sectionId, blocks)

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
            id={ids.get(index)}
            className="target:flash -mx-1.5 scroll-mt-32 rounded-md px-1.5 pt-3 text-[1.0625rem]/snug font-semibold text-foreground lg:scroll-mt-24"
          >
            {block.text}
          </h3>
        )
      case "ul":
        return (
          <ul key={key} className="flex flex-col gap-2 ps-5 leading-normal">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="relative before:absolute before:-inset-s-4 before:top-[0.6em] before:size-1.5 before:rounded-full before:bg-brand"
              >
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
              <a href={`mailto:${SITE.email}`} className="text-link">
                {SITE.email}
              </a>
            </p>
            <p>{block.team}</p>
          </div>
        )
    }
  })
}
