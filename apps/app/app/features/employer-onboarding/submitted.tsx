import { useTranslation } from "@workspace/i18n/react"
import { CircleCheck } from "lucide-react"
import * as m from "motion/react-m"

import { AppLink } from "@/components/app-link"
import { duration, ease } from "@/lib/motion"
import { buttonLink } from "@/lib/button-link"

/** After submitting: what happens to the documents, and what to do meanwhile. */
export function Submitted({ email }: { email: string }) {
  const { t } = useTranslation("onboarding")
  const next = ["review", "contact", "start"] as const

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease }}
      className="flex max-w-xl flex-col gap-6"
    >
      <CircleCheck className="size-8 text-success" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1
          tabIndex={-1}
          ref={(el) => {
            el?.focus()
          }}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          {t("done.title")}
        </h1>
        <p className="text-muted-foreground">{t("done.lead")}</p>
      </div>
      <section aria-labelledby="next-steps" className="flex flex-col gap-3">
        <h2 id="next-steps" className="text-sm font-medium">
          {t("done.nextHeading")}
        </h2>
        <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm">
          {next.map((key) => (
            <li key={key}>{t(`done.${key}`, { email })}</li>
          ))}
        </ol>
      </section>
      <div className="flex flex-wrap gap-2">
        <AppLink to="/employer/post-job" className={buttonLink()}>
          {t("done.postJob")}
        </AppLink>
        <AppLink to="/employer" className={buttonLink({ variant: "outline" })}>
          {t("done.dashboard")}
        </AppLink>
      </div>
    </m.div>
  )
}
