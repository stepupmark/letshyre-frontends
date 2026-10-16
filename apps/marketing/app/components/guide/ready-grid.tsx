import type { LucideIcon } from "lucide-react"
import { type ReactNode, useId } from "react"

import { Section, SectionHeader } from "@/components/section"

export interface ReadyItem {
  id: string
  icon: LucideIcon
  title: string
  desc: ReactNode
}

/** The "have these to hand" grid that opens a guide. */
export function ReadyGrid({
  anchor,
  title,
  description,
  items,
}: {
  anchor: string
  title: string
  description: string
  items: ReadyItem[]
}) {
  const titleId = useId()

  return (
    <Section
      id={anchor}
      aria-labelledby={titleId}
      className="scroll-mt-24 border-b py-12 sm:py-16"
    >
      <SectionHeader
        id={titleId}
        title={<span className="text-brand-text">{title}</span>}
        description={description}
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ id, icon: Icon, title, desc }) => (
          <li
            key={id}
            className="reveal group/item flex gap-4 rounded-2xl border p-5 transition-colors hover:border-brand/40"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text transition-transform duration-200 group-hover/item:-translate-y-0.5 motion-reduce:transition-none">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">
                {desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
