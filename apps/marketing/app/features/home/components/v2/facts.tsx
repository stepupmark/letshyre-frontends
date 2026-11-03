import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

export function Facts() {
  const { t } = useTranslation("homeV2")

  return (
    <section aria-label={t("facts.label")} className="border-y">
      <Container>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {t("facts.items", { returnObjects: true }).map((fact) => (
            <div
              key={fact.value}
              className="flex flex-col-reverse justify-end gap-1 py-8 max-lg:odd:border-e max-lg:even:ps-6 lg:border-e lg:px-8 lg:first:ps-0 lg:last:border-0"
            >
              <dt className="text-sm text-pretty text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
