import { useTranslation } from "@workspace/i18n/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

import { Container } from "@/components/section"

import { splitNumber, type TocEntry } from "../lib/legal-doc"
import { LegalToc } from "./legal-toc"

interface NavProps {
  label: string
  entries: TocEntry[]
  active?: string
}

export function LegalNav({ label, entries, active }: NavProps) {
  return (
    <nav aria-label={label} className="hidden lg:block print:hidden">
      <div className="sticky top-24 flex max-h-[calc(100svh-7rem)] flex-col gap-2 overflow-y-auto pb-2">
        <p aria-hidden className="px-3 text-[0.8125rem] font-semibold">
          {label}
        </p>
        <LegalToc entries={entries} active={active} />
      </div>
    </nav>
  )
}

/** Sits under the header on small screens and says where the reader is. */
export function LegalMobileNav({ label, entries, active }: NavProps) {
  const { t } = useTranslation("common")
  const [open, setOpen] = useState(false)
  const index = entries.findIndex(
    (entry) =>
      entry.id === active || entry.children.some((child) => child.id === active)
  )
  const current = entries[index]

  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur-md lg:hidden print:hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <Container>
          <CollapsibleTrigger className="group flex h-12 w-full items-center gap-3 text-start text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className="font-medium">{label}</span>
            {current && (
              <span className="flex min-w-0 flex-1 items-center gap-2 text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground tabular-nums">
                  {t("legal.progress", {
                    current: index + 1,
                    total: entries.length,
                  })}
                </span>
                <span className="truncate">
                  {splitNumber(current.title).rest}
                </span>
              </span>
            )}
            <ChevronDownIcon
              aria-hidden
              className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="-mx-3 max-h-[60svh] overflow-y-auto pb-3">
            <LegalToc
              entries={entries}
              active={active}
              onNavigate={() => {
                setOpen(false)
              }}
            />
          </CollapsibleContent>
        </Container>
      </Collapsible>
    </nav>
  )
}
