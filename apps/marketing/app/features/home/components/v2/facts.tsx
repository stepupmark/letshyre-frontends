import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

export function Facts() {
  const { t } = useTranslation("homeV2")

  return (
    <section aria-label={t("facts.label")} className="border-t">
      <Container>
        <dl className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
          {t("facts.items", { returnObjects: true }).map((fact) => (
            <div
              key={fact.value}
              className="flex flex-col-reverse justify-end gap-1 bg-background py-6 max-lg:odd:pe-4 max-lg:even:ps-5 sm:py-8 lg:px-8 lg:first:ps-0"
            >
              <dt className="text-sm text-pretty text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
