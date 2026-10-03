import { Trans, useFormat, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"
import { Link } from "react-router"

import { APP_LINKS } from "@/lib/app-links"

const STEPS = ["download", "install", "interview"] as const

export function InstallSteps() {
  const { t } = useTranslation("download")
  const format = useFormat()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-8">
      <h2
        id={titleId}
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {t("install.title")}
      </h2>
      <ol className="grid gap-8 md:grid-cols-3">
        {STEPS.map((id, index) => (
          <li key={id} className="flex flex-col gap-3 border-t pt-6">
            <span
              aria-hidden
              className="text-sm font-medium text-muted-foreground tabular-nums"
            >
              {format.number(index + 1, { minimumIntegerDigits: 2 })}
            </span>
            <h3 className="text-lg font-semibold">{t(`steps.${id}`)}</h3>
            <p className="text-pretty text-muted-foreground">
              {id === "interview" ? (
                <Trans
                  t={t}
                  i18nKey="install.interview"
                  components={{
                    signIn: (
                      <Link
                        to={APP_LINKS.candidateSignIn}
                        reloadDocument
                        className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                      />
                    ),
                  }}
                />
              ) : (
                t(`install.${id}`)
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
