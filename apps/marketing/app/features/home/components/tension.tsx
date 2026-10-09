import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { HomeHeading } from "./home-heading"

interface Side {
  label: string
  body: string
}

export function Tension() {
  const { t } = useTranslation("home")
  const sides = [
    t("tension.employer", { returnObjects: true }),
    t("tension.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <section
      aria-labelledby="tension-title"
      className="pt-4 pb-14 sm:pt-6 sm:pb-20"
    >
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <HomeHeading
            id="tension-title"
            eyebrow={t("tension.eyebrow")}
            title={t("tension.title")}
            accent={t("tension.accent")}
          />
          <dl className="mt-10 grid gap-8 sm:grid-cols-2">
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

        <figure
          aria-hidden
          className="reveal relative mx-auto w-full max-w-md rotate-1 rounded-2xl border bg-card p-8"
        >
          <div className="flex flex-col gap-2">
            <span className="h-1.5 w-1/3 rounded-full bg-muted" />
            <span className="h-1.5 w-11/12 rounded-full bg-muted" />
            <span className="h-1.5 w-4/5 rounded-full bg-muted" />
          </div>
          <p className="mt-6 text-lg text-muted-foreground line-through decoration-brand decoration-2">
            {t("tension.claim")}
          </p>
          <p className="font-script mt-2 -rotate-2 text-4xl text-brand-text">
            {t("tension.correction")}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <span className="h-1.5 w-full rounded-full bg-muted" />
            <span className="h-1.5 w-2/3 rounded-full bg-muted" />
          </div>
        </figure>
      </Container>
    </section>
  )
}
