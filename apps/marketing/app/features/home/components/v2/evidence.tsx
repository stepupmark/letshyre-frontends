import { useTranslation } from "@workspace/i18n/react"
import { EyeIcon, LockOpenIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"

import { ExplainedShot } from "./product-shot"
import { SCORECARD, SCORECARD_SPOTS } from "./shots"

export function Evidence() {
  const { t } = useTranslation(["home", "homeV2"])

  return (
    <Band id="evidence" muted>
      <BandHeading
        id="evidence-title"
        eyebrow={t("home:evidence.eyebrow")}
        title={t("home:evidence.title")}
        accent={t("home:evidence.accent")}
        description={t("home:evidence.description")}
        className="slide-in"
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <ExplainedShot
          shot={SCORECARD}
          alt={t("homeV2:evidence.alt")}
          sizes="(min-width: 1024px) 680px, 100vw"
          callouts={t("homeV2:evidence.callouts", { returnObjects: true })}
          spots={SCORECARD_SPOTS}
          className="reveal"
        />
        <div className="slide-in grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Layer
            icon={<EyeIcon aria-hidden className="size-4" />}
            title={t("home:evidence.open.title")}
            items={t("home:evidence.open.items", { returnObjects: true })}
          />
          <Layer
            icon={<LockOpenIcon aria-hidden className="size-4" />}
            title={t("home:evidence.locked.title")}
            items={t("home:evidence.locked.items", { returnObjects: true })}
          />
        </div>
      </div>
    </Band>
  )
}

function Layer({
  icon,
  title,
  items,
}: {
  icon: ReactNode
  title: string
  items: readonly string[]
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="flex items-center gap-2 font-semibold text-brand-text">
        {icon}
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {items.map((item, index) => (
          <li
            key={item}
            className="drop-in flex items-center gap-2.5"
            style={{ "--i": index } as CSSProperties}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
