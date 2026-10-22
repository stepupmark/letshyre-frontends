import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { AppLink } from "@/components/app-link"

export function BackLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <AppLink
      to={to}
      className="group flex w-fit max-w-full items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeft
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:translate-x-0.5"
      />
      <span className="truncate">{children}</span>
    </AppLink>
  )
}
