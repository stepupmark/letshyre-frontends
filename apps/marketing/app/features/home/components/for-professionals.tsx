import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { HomeHeading } from "./home-heading"

interface Interview {
  label: string
  role: string
}

const TILTS = ["-rotate-3", "rotate-1", "rotate-3"]

export function ForProfessionals() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const interviews = t("professionals.interviews", {
    returnObjects: true,
  }) as Interview[]
  const points = t("professionals.points", { returnObjects: true })

  return (
    <section
      id="for-professionals"
      aria-labelledby="professionals-title"
      className="scroll-mt-20 bg-muted/40 py-14 sm:py-20"
    >
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <HomeHeading
            id="professionals-title"
            eyebrow={t("professionals.eyebrow")}
            title={t("professionals.title")}
            accent={t("professionals.accent")}
            description={t("professionals.description")}
          />
          <ul className="mt-8 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckIcon
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-brand-text"
                />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={APP_LINKS.candidateRegister}
              className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}
            >
              {t("professionals.cta")}
            </a>
            <Link
              to={localePath(lang, "/interview-guide")}
              prefetch="intent"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {t("professionals.guide")}
            </Link>
            <Link
              to={localePath(lang, "/download")}
              prefetch="intent"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {t("professionals.download")}
            </Link>
          </div>
        </div>

        <ol className="reveal mx-auto flex w-full max-w-md flex-col gap-4">
          {interviews.map((interview, index) => (
            <li
              key={interview.label}
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border bg-card p-5",
                TILTS[index]
              )}
            >
              <div>
                <p className="font-display text-2xl">{interview.label}</p>
                <p className="text-sm text-muted-foreground">
                  {interview.role}
                </p>
              </div>
              <span className="rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand-text">
                {t("professionals.scorecard")}
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
