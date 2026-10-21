import { useTranslation } from "@workspace/i18n/react"
import { EyeIcon, LockOpenIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"

function Column({
  icon,
  title,
  items,
}: {
  icon: ReactNode
  title: string
  items: string[]
}) {
  return (
    <div className="reveal rounded-3xl border bg-card p-6 sm:p-7">
      <h3 className="flex items-center gap-2 font-semibold [&_svg]:size-5 [&_svg]:text-brand-text">
        {icon}
        {title}
      </h3>
      <ul className="mt-5 flex flex-col divide-y">
        {items.map((item) => (
          <li key={item} className="py-2.5 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function WhatEmployersSee() {
  const { t } = useTranslation("candidates")
  const before = t("seen.before.items", { returnObjects: true })
  const after = t("seen.after.items", { returnObjects: true })

  return (
    <Band id="seen" muted>
      <BandHeading
        id="seen-title"
        className="slide-in"
        eyebrow={t("seen.eyebrow")}
        title={t("seen.title")}
        accent={t("seen.accent")}
        description={t("seen.description")}
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Column
          icon={<EyeIcon aria-hidden />}
          title={t("seen.before.title")}
          items={before}
        />
        <Column
          icon={<LockOpenIcon aria-hidden />}
          title={t("seen.after.title")}
          items={after}
        />
      </div>

      <div className="reveal mt-4 rounded-3xl border bg-card p-6 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <h3 className="font-semibold text-brand-text">
            {t("seen.timeline.title")}
          </h3>
          <p className="max-w-xl text-sm text-pretty text-muted-foreground">
            {t("seen.timeline.body")}
          </p>
        </div>
        <div aria-hidden className="mt-6">
          <div className="relative h-2 rounded-full bg-muted">
            <span className="grow-in absolute inset-0 origin-[0%_50%] rounded-full bg-brand rtl:origin-[100%_50%]" />
            <span className="absolute inset-s-0 -top-1 size-4 rounded-full border-4 border-card bg-brand" />
            <span className="absolute inset-e-0 -top-1 size-4 rounded-full border-4 border-card bg-brand" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{t("seen.timeline.start")}</span>
            <span>{t("seen.timeline.end")}</span>
          </div>
        </div>
      </div>
    </Band>
  )
}
