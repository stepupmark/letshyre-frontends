import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight } from "lucide-react"

import { Handover } from "./art/handover"

export function SharedByFooter({ company }: { company?: string | null }) {
  const { t } = useTranslation(["scorecard", "common"])

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-center sm:p-6 print:hidden">
      <Handover />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold text-balance text-brand-text">
          {company ? t("footer.sharedBy", { company }) : t("footer.shared")}
        </p>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("footer.body")}
        </p>
      </div>
      {/* the marketing site, so a full page load */}
      <a
        href="/"
        className="group/link inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-md text-sm font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 sm:self-center"
      >
        {t("footer.about", { app: t("common:appName") })}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/link:-translate-x-0.5"
        />
      </a>
    </aside>
  )
}
