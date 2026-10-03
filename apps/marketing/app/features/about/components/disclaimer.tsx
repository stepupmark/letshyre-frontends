import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Link } from "react-router"

import { Container } from "@/components/section"

export function Disclaimer() {
  const { t } = useTranslation("about")
  const lang = useLocale()

  return (
    <Container className="pb-16 sm:pb-24">
      <section
        aria-labelledby="about-disclaimer"
        className="flex flex-col items-start gap-4 rounded-xl border bg-muted/40 p-6 sm:p-8"
      >
        <h2
          id="about-disclaimer"
          className="text-xl font-semibold tracking-tight"
        >
          {t("commitment.title")}
        </h2>
        <p className="max-w-3xl text-pretty text-muted-foreground">
          {t("commitment.body")}
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to={localePath(lang, "/contact")} />}
        >
          {t("commitment.contactUs")}
        </Button>
      </section>
    </Container>
  )
}
