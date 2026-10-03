import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

export function Audiences() {
  const { t } = useTranslation("about")
  const employers = t("whatWeDo.employerPoints", { returnObjects: true })
  const candidates = t("whatWeDo.candidatePoints", { returnObjects: true })

  return (
    <Container className="py-16 sm:py-24">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("whatWeDo.employersHeading")}
          </h2>
          <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-muted-foreground">
            {employers.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("whatWeDo.candidatesHeading")}
          </h2>
          <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-muted-foreground">
            {candidates.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  )
}
