import { PlusIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface FaqItem {
  id: string
  question: string
  answer: ReactNode
}

export function GuideFaq({
  anchor,
  title,
  items,
}: {
  anchor: string
  title: string
  items: FaqItem[]
}) {
  return (
    <section
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="scroll-mt-24 border-t pt-12"
    >
      <h2
        id={`${anchor}-title`}
        className="text-2xl font-semibold tracking-tight text-balance text-brand-text sm:text-3xl"
      >
        {title}
      </h2>
      <ul className="mt-6 flex flex-col divide-y border-y">
        {items.map((item) => (
          <li key={item.id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 rounded-md py-4 font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span className="flex-1 text-pretty">{item.question}</span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full border transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                  <PlusIcon
                    aria-hidden
                    className="size-4 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  />
                </span>
              </summary>
              <p className="max-w-2xl pe-11 pb-5 text-pretty text-muted-foreground">
                {item.answer}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
