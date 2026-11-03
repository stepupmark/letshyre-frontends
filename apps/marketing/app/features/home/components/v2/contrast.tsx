import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"

import { ResumePile, VerifiedProfile } from "./scenes/contrast-scenes"

export function Contrast() {
  const { t } = useTranslation("homeV2")

  return (
    <Band id="contrast" muted>
      <BandHeading
        id="contrast-title"
        eyebrow={t("contrast.eyebrow")}
        title={t("contrast.title")}
        accent={t("contrast.accent")}
        className="slide-in max-w-3xl"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Side
          tone="before"
          title={t("contrast.before.title")}
          items={t("contrast.before.items", { returnObjects: true })}
          scene={<ResumePile />}
        />
        <Side
          tone="after"
          title={t("contrast.after.title")}
          items={t("contrast.after.items", { returnObjects: true })}
          scene={<VerifiedProfile />}
        />
      </div>
    </Band>
  )
}

function Side({
  tone,
  title,
  items,
  scene,
}: {
  tone: "before" | "after"
  title: string
  items: readonly string[]
  scene: ReactNode
}) {
  const before = tone === "before"
  const Icon = before ? XIcon : CheckIcon

  return (
    <article
      className={cn(
        "slide-in flex flex-col rounded-3xl border bg-card p-3 sm:p-4",
        !before && "border-brand/30"
      )}
    >
      <div
        className={cn(
          "flex h-60 items-center justify-center overflow-hidden rounded-2xl p-6",
          before ? "bg-muted/60" : "bg-brand-muted/40"
        )}
      >
        {scene}
      </div>
      <div className="p-3 pt-8 sm:p-4 sm:pt-8">
        <h3 className="text-lg font-semibold">{title}</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-pretty">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  before
                    ? "bg-muted text-muted-foreground"
                    : "bg-brand-muted text-brand-text"
                )}
              >
                <Icon aria-hidden className="size-3" />
              </span>
              <span className={cn(before && "text-muted-foreground")}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
