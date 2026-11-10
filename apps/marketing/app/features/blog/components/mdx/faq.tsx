import { ChevronDownIcon } from "lucide-react"
import type { ReactNode } from "react"

/** Questions readers ask, each opening its answer; the post's FAQ schema is read from them. */
export function Faq({ children }: { children: ReactNode }) {
  return (
    <div className="my-2 flex flex-col divide-y rounded-xl border">
      {children}
    </div>
  )
}

export function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group px-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDownIcon
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="flex flex-col gap-3 pb-4 text-pretty">{children}</div>
    </details>
  )
}
