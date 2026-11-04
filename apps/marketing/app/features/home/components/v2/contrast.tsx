import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Band } from "@/components/band"

import { Heading } from "./heading"
import { ResumePile, VerifiedProfile } from "./scenes/contrast-scenes"

export function Contrast() {
  const { t } = useTranslation("homeV2")

  return (
    <Band id="contrast">
      <Heading
        id="contrast-title"
        eyebrow={t("contrast.eyebrow")}
        title={t("contrast.title")}
        accent={t("contrast.accent")}
        className="slide-in max-w-3xl"
      />
      <div className="slide-in mt-12 grid overflow-hidden rounded-3xl border bg-card md:grid-cols-2">
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
        "flex flex-col",
        before ? "max-md:border-b md:border-e" : "bg-brand-muted/25"
      )}
    >
      <div className="flex h-64 items-center justify-center overflow-hidden border-b px-6">
        {scene}
      </div>
      <div className="p-6 sm:p-10">
        <h3
          className={cn(
            "text-sm font-medium",
            before ? "text-muted-foreground" : "text-brand-text"
          )}
        >
          {title}
        </h3>
        <ul className="mt-5 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-pretty">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  before
                    ? "bg-muted text-muted-foreground"
                    : "bg-brand text-primary-foreground"
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
