import { Trans, useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

import { Container } from "./section"

export function PricingHero() {
  const { t } = useTranslation("pricing")
  const items = t("hero.items", { returnObjects: true })

  return (
    <header className="border-b">
      <Container className="flex flex-col gap-4 py-10 sm:py-14">
        <p className="text-sm font-semibold text-primary">
          {t("hero.eyebrow")}
        </p>
        <h1
          tabIndex={-1}
          className="max-w-3xl text-4xl/[1.1] font-semibold tracking-tight text-balance outline-none sm:text-5xl/[1.05]"
        >
          <Trans
            t={t}
            i18nKey="hero.title"
            components={{ hl: <span className="text-brand" /> }}
          />
        </h1>
        <p className="max-w-2xl text-lg/7 text-pretty text-muted-foreground">
          {t("hero.body")}
        </p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
          <p className="text-sm font-medium">{t("hero.includes")}</p>
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <CheckIcon aria-hidden className="size-4 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </header>
  )
}
