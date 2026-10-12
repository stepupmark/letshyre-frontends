import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { LifeBuoy } from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { PAGES } from "@/lib/pages"

export function SupportBand() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-2xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text">
        <LifeBuoy aria-hidden className="size-5" />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <h2 id={titleId} className="text-base/6 font-semibold">
          {t("support.title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("support.body")}</p>
      </div>
      <Link
        to={localePath(lang, PAGES.contact.path)}
        className={buttonVariants({
          variant: "outline",
          size: "lg",
          className: "h-10 px-4",
        })}
      >
        {t("support.contact")}
      </Link>
    </section>
  )
}
