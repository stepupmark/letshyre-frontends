import { useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router"

import { usePagePath } from "@/hooks/use-page-path"

const PAGE = { employers: "employers", candidates: "candidates" } as const

/** A short link, inside a post, to the part of LetsHyre the paragraph above is about. */
export function Feature({ audience }: { audience: keyof typeof PAGE }) {
  const { t } = useTranslation("blog")
  const pagePath = usePagePath()

  return (
    <Link
      to={pagePath(PAGE[audience])}
      className="group my-2 flex items-center justify-between gap-4 rounded-xl border p-4 text-base transition-colors duration-200 outline-none hover:border-brand/40 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none print:hidden"
    >
      <span className="flex flex-col gap-1">
        <span className="font-semibold text-balance text-foreground">
          {t(`mdx.feature.${audience}.title`)}
        </span>
        <span className="text-sm text-pretty text-muted-foreground">
          {t(`mdx.feature.${audience}.description`)}
        </span>
      </span>
      <ArrowRightIcon
        aria-hidden
        className="size-5 shrink-0 text-brand-text transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
      />
    </Link>
  )
}
