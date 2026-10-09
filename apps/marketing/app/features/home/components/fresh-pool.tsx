import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { HomeHeading } from "./home-heading"

interface Side {
  label: string
  body: string
}

export function FreshPool() {
  const { t } = useTranslation("home")
  const sides = [
    t("fresh.employer", { returnObjects: true }),
    t("fresh.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <section aria-labelledby="fresh-title" className="py-14 sm:py-20">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div aria-hidden className="reveal flex flex-col items-center">
          <p className="flex items-baseline gap-3">
            <span className="font-display text-[9rem] leading-none tracking-tighter sm:text-[12rem]">
              90
            </span>
            <span className="font-script text-5xl text-brand-text">
              {t("fresh.days")}
            </span>
          </p>
          <div className="mt-6 flex w-full max-w-sm items-center gap-3 text-xs text-muted-foreground">
            <span>{t("fresh.start")}</span>
            <span className="relative h-px flex-1 bg-border">
              <span className="absolute inset-s-[30%] -top-1 size-2.5 rounded-full bg-brand" />
              <span className="absolute inset-s-[55%] -top-1 size-2.5 rounded-full bg-brand" />
              <span className="absolute inset-s-[80%] -top-1 size-2.5 rounded-full border-2 border-brand bg-background" />
            </span>
            <span>{t("fresh.end")}</span>
          </div>
        </div>

        <div className="reveal">
          <HomeHeading
            id="fresh-title"
            eyebrow={t("fresh.eyebrow")}
            title={t("fresh.title")}
            accent={t("fresh.accent")}
          />
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {sides.map((side) => (
              <div key={side.label}>
                <dt className="text-sm font-semibold">{side.label}</dt>
                <dd className="mt-2 text-pretty text-muted-foreground">
                  {side.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
