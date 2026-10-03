import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

export function SiteFooter() {
  const { t } = useTranslation("common")

  return (
    <footer className="border-t">
      <Container className="py-8 text-sm text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </Container>
    </footer>
  )
}
