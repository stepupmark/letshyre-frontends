import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import * as m from "motion/react-m"

import { spring } from "@/lib/motion"

const INDICATOR = "chapter-rail"

export interface RailItem {
  id: string
  label: string
}

export function ChapterRail({
  items,
  active,
}: {
  items: RailItem[]
  active: string
}) {
  const { t } = useTranslation("scorecard")

  return (
    <nav
      aria-label={t("toc.label")}
      className="sticky top-20 hidden self-start xl:block print:hidden"
    >
      <p className="mb-3 ps-3 text-xs font-medium text-muted-foreground">
        {t("toc.label")}
      </p>
      <ol className="flex flex-col border-s">
        {items.map((item) => {
          const current = item.id === active
          return (
            <li key={item.id} className="relative">
              {current && (
                <m.span
                  layoutId={INDICATOR}
                  transition={spring}
                  className="absolute inset-y-1 -inset-s-px w-0.5 rounded-full bg-brand"
                />
              )}
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "flex rounded-e-md py-1.5 ps-3 pe-2 text-sm transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  current
                    ? "font-medium text-brand-text"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ChapterPills({
  items,
  active,
}: {
  items: RailItem[]
  active: string
}) {
  const { t } = useTranslation("scorecard")

  return (
    <nav
      aria-label={t("toc.label")}
      className="no-scrollbar overflow-x-auto mask-r-from-85% xl:hidden rtl:mask-r-from-100% rtl:mask-l-from-85% print:hidden"
    >
      <ol className="flex w-max gap-1.5 pe-12">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === active ? "location" : undefined}
              className="flex min-h-10 items-center rounded-full border px-3.5 text-sm whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=location]:border-brand/40 aria-[current=location]:bg-brand-muted aria-[current=location]:text-brand-text"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
