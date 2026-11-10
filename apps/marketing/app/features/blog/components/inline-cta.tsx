import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { use } from "react"
import { Link } from "react-router"

import { usePagePath } from "@/hooks/use-page-path"

import { CTA_TARGETS, InlineCtaSlot } from "../lib/cta"

export function InlineCta({ before }: { before: string | undefined }) {
  const slot = use(InlineCtaSlot)
  const { t } = useTranslation("blog")
  const pagePath = usePagePath()
  if (!slot || slot.before !== before) return null

  const { audience } = slot
  const target = CTA_TARGETS[audience]

  return (
    <aside
      aria-label={t(`cta.${audience}.title`)}
      className="my-4 flex flex-col gap-4 rounded-xl border bg-muted/40 p-5 text-base sm:p-6 print:hidden"
    >
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-balance text-foreground">
          {t(`cta.${audience}.title`)}
        </p>
        <p className="text-sm text-pretty text-muted-foreground">
          {t(`cta.${audience}.description`)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={target.href} className={buttonVariants()}>
          {t(`cta.${audience}.primary`)}
        </a>
        <Link
          to={pagePath(target.page)}
          className={buttonVariants({ variant: "outline" })}
        >
          {t(`cta.${audience}.secondary`)}
        </Link>
      </div>
    </aside>
  )
}
