import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

export function MissionVision() {
  const { t } = useTranslation("about")

  return (
    <Container className="grid gap-4 md:grid-cols-2">
      <section
        aria-labelledby="about-mission"
        className="flex flex-col gap-3 rounded-xl border p-6 sm:p-8"
      >
        <h2 id="about-mission" className="text-xl font-semibold tracking-tight">
          {t("mission.title")}
        </h2>
        <p className="text-pretty text-muted-foreground">{t("mission.desc")}</p>
      </section>
      <section
        aria-labelledby="about-vision"
        className="flex flex-col gap-3 rounded-xl border p-6 sm:p-8"
      >
        <h2 id="about-vision" className="text-xl font-semibold tracking-tight">
          {t("vision.title")}
        </h2>
        <p className="text-pretty text-muted-foreground">{t("vision.desc")}</p>
      </section>
    </Container>
  )
}
