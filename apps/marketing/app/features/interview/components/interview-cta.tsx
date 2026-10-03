import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { Link } from "react-router"

export function InterviewCta() {
  const { t } = useTranslation("interview")
  const lang = useLocale()

  return (
    <section
      aria-labelledby="interview-cta-title"
      className="flex flex-col items-start gap-4 rounded-xl border bg-muted/40 p-6 sm:p-8"
    >
      <h2
        id="interview-cta-title"
        className="text-2xl font-semibold tracking-tight"
      >
        {t("cta.title")}
      </h2>
      <p className="max-w-xl text-pretty text-muted-foreground">
        {t("cta.desc")}
      </p>
      <Link
        to={localePath(lang, "/download")}
        className={buttonVariants({ size: "lg" })}
      >
        {t("cta.button")}
      </Link>
    </section>
  )
}
