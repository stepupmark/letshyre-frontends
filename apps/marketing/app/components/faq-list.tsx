import { PlusIcon } from "lucide-react"

export interface FaqItem {
  q: string
  a: string
}

const twoDigit = (n: number) => String(n).padStart(2, "0")

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item.q}>
          <details className="group rounded-2xl border border-transparent transition-colors open:border-border open:bg-card hover:bg-muted/40 open:hover:bg-card">
            <summary className="flex cursor-pointer list-none items-center gap-5 rounded-2xl p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden
                className="w-6 shrink-0 text-sm font-semibold text-muted-foreground tabular-nums group-open:text-brand-text"
              >
                {twoDigit(index + 1)}
              </span>
              <span className="flex-1 font-medium text-pretty">{item.q}</span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                <PlusIcon
                  aria-hidden
                  className="size-4 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                />
              </span>
            </summary>
            <p className="rise ps-16 pe-14 pb-6 text-pretty text-muted-foreground">
              {item.a}
            </p>
          </details>
        </li>
      ))}
    </ol>
  )
}
