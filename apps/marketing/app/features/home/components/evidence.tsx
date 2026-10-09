import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon, LockIcon } from "lucide-react"

import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"

export function Evidence() {
  const { t } = useTranslation("home")
  const open = t("evidence.open.items", { returnObjects: true })
  const locked = t("evidence.locked.items", { returnObjects: true })

  return (
    <HomeSection
      id="evidence"
      className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16"
    >
      <HomeHeading
        id="evidence-title"
        eyebrow={t("evidence.eyebrow")}
        title={t("evidence.title")}
        accent={t("evidence.accent")}
        description={t("evidence.description")}
        className="reveal"
      />

      <div className="reveal relative grid gap-4 pt-8 sm:grid-cols-2 sm:pb-8">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-sm font-semibold">{t("evidence.open.title")}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {open.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <CheckIcon aria-hidden className="size-4 text-brand-text" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-muted p-6 sm:translate-y-8">
          <h3 className="text-sm font-semibold">
            {t("evidence.locked.title")}
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {locked.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <LockIcon aria-hidden className="size-4 text-foreground/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p
          aria-hidden
          className="font-script absolute inset-s-2 -top-2 -rotate-3 text-3xl text-brand-text"
        >
          {t("evidence.notes.compare")}
        </p>
        <p
          aria-hidden
          className="font-script absolute inset-e-2 -bottom-9 rotate-2 text-3xl text-brand-text sm:inset-s-4 sm:inset-e-auto sm:-bottom-1"
        >
          {t("evidence.notes.full")}
        </p>
      </div>
    </HomeSection>
  )
}
